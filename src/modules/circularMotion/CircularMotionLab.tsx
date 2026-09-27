import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { CircularMotionTheory } from './CircularMotionTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Layers, Eye, RotateCw } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Camera3D {
  x: number;
  y: number;
  z: number;
  forward: Point3D;
  right: Point3D;
  up: Point3D;
  f: number;
}

interface CircularMotionLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const CircularMotionLab: React.FC<CircularMotionLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [subMode, setSubMode] = useState<'banked_road' | 'vertical_loop' | 'conical_pendulum'>('banked_road');

  // Scenario 1: Banked Road
  const [roadRadius, setRoadRadius] = useState<number>(50); // m
  const [bankingAngleDeg, setBankingAngleDeg] = useState<number>(20); // deg
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.25);
  const [carSpeed, setCarSpeed] = useState<number>(15); // m/s
  const [gravity] = useState<number>(9.8); // m/s²
  const [bankedViewMode, setBankedViewMode] = useState<'3d_orbit' | '3d_chase' | '2d_cross_section'>('3d_orbit');

  // 3D Camera Controls for Banked Road
  const [camYaw, setCamYaw] = useState<number>(0.75); // radians
  const [camPitch, setCamPitch] = useState<number>(0.42); // radians
  const [camDist, setCamDist] = useState<number>(95); // meters
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Scenario 2: Vertical Circular Motion
  const [loopRadius, setLoopRadius] = useState<number>(5); // m
  const [bottomSpeed, setBottomSpeed] = useState<number>(16); // m/s

  // Scenario 3: Conical Pendulum
  const [pendulumLength, setPendulumLength] = useState<number>(4); // m
  const [conicalAngleDeg, setConicalAngleDeg] = useState<number>(30); // deg

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [showTrajectoryGrid, setShowTrajectoryGrid] = useState<boolean>(true);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 14, originX: 410, originY: 260 }));
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Dynamic simulation variables
  const currentAngleRef = useRef<number>(0);
  const verticalOmegaRef = useRef<number>(16 / 5);
  const slackStateRef = useRef<{
    isSlacked: boolean;
    slackTheta: number;
    slackV: number;
    projT: number;
    projX: number;
    projY: number;
    projVx: number;
    projVy: number;
  }>({
    isSlacked: false,
    slackTheta: 0,
    slackV: 0,
    projT: 0,
    projX: 0,
    projY: 0,
    projVx: 0,
    projVy: 0,
  });
  const renderSceneRef = useRef<() => void>(() => {});
  const paramsRef = useRef({
    subMode,
    carSpeed,
    roadRadius,
    bankingAngleDeg,
    frictionCoeff,
    loopRadius,
    bottomSpeed,
    conicalAngleDeg,
    pendulumLength,
    gravity,
    timeScale,
    coneOmega: 1.5,
  });

  // Analytical: Banked Road
  const bankRad = (bankingAngleDeg * Math.PI) / 180;
  const tanBank = Math.tan(bankRad);
  const vOptimum = Math.sqrt(roadRadius * gravity * tanBank);

  const denomMax = 1 - frictionCoeff * tanBank;
  const vMax = denomMax > 0 ? Math.sqrt(roadRadius * gravity * ((tanBank + frictionCoeff) / denomMax)) : Infinity;

  const numMin = tanBank - frictionCoeff;
  const vMin = numMin > 0 ? Math.sqrt(roadRadius * gravity * (numMin / (1 + frictionCoeff * tanBank))) : 0;

  const isSkidding = carSpeed > vMax;
  const isSlipping = carSpeed < vMin && vMin > 0;
  const isSafe = !isSkidding && !isSlipping;
  const isOptimum = Math.abs(carSpeed - vOptimum) < 0.5;

  // Analytical: Vertical Loop
  const critOsc = Math.sqrt(2 * gravity * loopRadius);
  const critLoop = Math.sqrt(5 * gravity * loopRadius);
  const u = bottomSpeed;
  const loopRegime = u >= critLoop ? 'looping' : u <= critOsc ? 'oscillating' : 'slacking';

  // Analytical: Conical Pendulum
  const coneRad = (conicalAngleDeg * Math.PI) / 180;
  const coneR = pendulumLength * Math.sin(coneRad);
  const coneH = pendulumLength * Math.cos(coneRad);
  const coneOmega = Math.sqrt(gravity / (Math.max(0.1, coneH)));
  const conePeriod = (2 * Math.PI) / coneOmega;
  const coneTension = (1 * gravity) / Math.cos(coneRad);

  // 3D Projection Engine Helper
  const projectToScreen = useCallback((
    pt: Point3D,
    cam: Camera3D,
    width: number,
    height: number
  ): { sx: number; sy: number; zDepth: number; visible: boolean } => {
    const dx = pt.x - cam.x;
    const dy = pt.y - cam.y;
    const dz = pt.z - cam.z;

    const xc = dx * cam.right.x + dy * cam.right.y + dz * cam.right.z;
    const yc = dx * cam.up.x + dy * cam.up.y + dz * cam.up.z;
    const zc = dx * cam.forward.x + dy * cam.forward.y + dz * cam.forward.z;

    if (zc < 0.5) {
      return { sx: 0, sy: 0, zDepth: zc, visible: false };
    }

    const scale = cam.f / zc;
    return {
      sx: width / 2 + xc * scale,
      sy: height / 2 - yc * scale,
      zDepth: zc,
      visible: true,
    };
  }, []);

  // 3D Vector Drawer Helper
  const draw3DVector = useCallback((
    ctx: CanvasRenderingContext2D,
    start: Point3D,
    vec: Point3D,
    cam: Camera3D,
    width: number,
    height: number,
    color: string,
    label: string,
    lineWidth: number = 2.0
  ) => {
    const end: Point3D = { x: start.x + vec.x, y: start.y + vec.y, z: start.z + vec.z };
    const p1 = projectToScreen(start, cam, width, height);
    const p2 = projectToScreen(end, cam, width, height);

    if (!p1.visible || !p2.visible) return;

    let dx = p2.sx - p1.sx;
    let dy = p2.sy - p1.sy;
    let len = Math.hypot(dx, dy);
    if (len < 2) return;

    // Keep screen length of FBD arrows compact (~45-50 px, like 5 cm)
    const targetLen = Math.max(24, Math.min(48, len));
    dx = (dx / len) * targetLen;
    dy = (dy / len) * targetLen;
    len = targetLen;

    const arrowEndX = p1.sx + dx;
    const arrowEndY = p1.sy + dy;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.min(2, lineWidth);

    // Line shaft
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(dy, dx);
    const headSize = Math.min(5.5, len * 0.28);
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(arrowEndX - headSize * Math.cos(angle - Math.PI / 6), arrowEndY - headSize * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(arrowEndX - headSize * Math.cos(angle + Math.PI / 6), arrowEndY - headSize * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Label tag
    ctx.font = 'bold 10px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(label, arrowEndX + (dx / len) * 11, arrowEndY + (dy / len) * 11);

    ctx.restore();
  }, [projectToScreen]);

  // Auto-fit function
  const autoFitViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coordSys = coordSysRef.current;
    const width = canvas.width;
    const height = canvas.height;

    if (subMode === 'banked_road') {
      coordSys.pixelsPerMeter = 18;
      coordSys.originX = width / 2;
      coordSys.originY = height / 2 + 50;
      setCamDist(Math.max(65, roadRadius * 1.55));
    } else if (subMode === 'vertical_loop') {
      const span = loopRadius * 2.8;
      const scale = Math.max(8, Math.min(30, (height - 80) / span));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = width / 2;
      coordSys.originY = height / 2 + 10;
    } else {
      // Conical Pendulum
      const span = pendulumLength * 2.4;
      const scale = Math.max(10, Math.min(35, (height - 80) / span));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = width / 2;
      coordSys.originY = height / 2 - 40;
    }
  }, [subMode, loopRadius, pendulumLength, roadRadius]);

  const handleReset = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.reset();
    }
    setCurrentTime(0);

    if (subMode === 'vertical_loop') {
      currentAngleRef.current = -Math.PI / 2; // Bottom of circle
      verticalOmegaRef.current = bottomSpeed / loopRadius;
      slackStateRef.current = {
        isSlacked: false,
        slackTheta: 0,
        slackV: 0,
        projT: 0,
        projX: 0,
        projY: 0,
        projVx: 0,
        projVy: 0,
      };
    } else {
      currentAngleRef.current = 0;
    }

    autoFitViewport();
    renderSceneRef.current();
  }, [subMode, bottomSpeed, loopRadius, autoFitViewport]);

  const switchSubMode = (newMode: 'banked_road' | 'vertical_loop' | 'conical_pendulum') => {
    setSubMode(newMode);
    setCurrentTime(0);
    if (loopRef.current) {
      loopRef.current.reset();
    }
    if (newMode === 'vertical_loop') {
      currentAngleRef.current = -Math.PI / 2;
      verticalOmegaRef.current = bottomSpeed / loopRadius;
      slackStateRef.current = {
        isSlacked: false,
        slackTheta: 0,
        slackV: 0,
        projT: 0,
        projX: 0,
        projY: 0,
        projVx: 0,
        projVy: 0,
      };
    } else {
      currentAngleRef.current = 0;
    }
    renderSceneRef.current();
  };

  // Main Canvas Render
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const coordSys = coordSysRef.current;

    // Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // SCENARIO 1: Banked Road (3D Perspective Engine or 2D Cross-Section)
    if (subMode === 'banked_road') {
      if (bankedViewMode === '3d_orbit' || bankedViewMode === '3d_chase') {
        // --- 3D PERSPECTIVE BANKED HIGHWAY ENGINE ---
        const carTrackAngle = currentAngleRef.current;
        const roadWidth = 14; // meters

        // Calculate lateral shift across roadway based on speed
        let lateralPos = roadWidth / 2; // default center of lane
        if (isOptimum) {
          lateralPos = roadWidth / 2;
        } else if (carSpeed > vOptimum) {
          const ratio = Math.min(1.0, (carSpeed - vOptimum) / Math.max(1, (isFinite(vMax) ? vMax - vOptimum : 20)));
          lateralPos = roadWidth / 2 + ratio * (roadWidth / 2 - 1.2);
        } else {
          const minDenom = Math.max(1, vOptimum - vMin);
          const ratio = Math.min(1.0, (vOptimum - carSpeed) / minDenom);
          lateralPos = Math.max(1.2, roadWidth / 2 - ratio * (roadWidth / 2 - 1.2));
        }

        const carRadius = roadRadius - (roadWidth / 2) * Math.cos(bankRad) + lateralPos * Math.cos(bankRad);
        const carHeight = lateralPos * Math.sin(bankRad) + 0.35;
        const carWorldPos: Point3D = {
          x: carRadius * Math.cos(carTrackAngle),
          y: carHeight,
          z: carRadius * Math.sin(carTrackAngle),
        };

        // Camera Setup
        let targetX = 0, targetY = 2, targetZ = 0;
        let camX = 0, camY = 0, camZ = 0;

        if (bankedViewMode === '3d_orbit') {
          targetX = carWorldPos.x * 0.3;
          targetY = carWorldPos.y * 0.4;
          targetZ = carWorldPos.z * 0.3;

          camX = targetX + camDist * Math.cos(camPitch) * Math.sin(camYaw);
          camY = targetY + camDist * Math.sin(camPitch);
          camZ = targetZ + camDist * Math.cos(camPitch) * Math.cos(camYaw);
        } else {
          // 3D Chase Cam (Following right behind car)
          targetX = carWorldPos.x;
          targetY = carWorldPos.y + 1.2;
          targetZ = carWorldPos.z;

          // Tangent forward vector: (-sin psi, 0, cos psi)
          // Behind vector: (sin psi, 0, -cos psi)
          const behindDist = 18;
          camX = carWorldPos.x + behindDist * Math.sin(carTrackAngle);
          camY = carWorldPos.y + 6.5;
          camZ = carWorldPos.z - behindDist * Math.cos(carTrackAngle);
        }

        // Camera Forward Vector (look at target)
        const fdx = targetX - camX;
        const fdy = targetY - camY;
        const fdz = targetZ - camZ;
        const flen = Math.hypot(fdx, fdy, fdz);
        const fwd: Point3D = { x: fdx / flen, y: fdy / flen, z: fdz / flen };

        // Camera Right Vector = fwd x (0, 1, 0)
        const rdx = -fwd.z;
        const rdz = fwd.x;
        const rlen = Math.hypot(rdx, rdz);
        const right: Point3D = { x: rdx / rlen, y: 0, z: rdz / rlen };

        // Camera Up Vector = right x fwd
        const up: Point3D = {
          x: right.y * fwd.z - right.z * fwd.y,
          y: right.z * fwd.x - right.x * fwd.z,
          z: right.x * fwd.y - right.y * fwd.x,
        };

        const cam: Camera3D = {
          x: camX,
          y: camY,
          z: camZ,
          forward: fwd,
          right,
          up,
          f: 480,
        };

        // 1. Draw 3D Ground Plane Grid (Faint circles and radial spokes)
        if (showTrajectoryGrid) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.lineWidth = 1;
          const gridRSteps = [roadRadius * 0.5, roadRadius, roadRadius * 1.5];
          gridRSteps.forEach(gr => {
            ctx.beginPath();
            for (let a = 0; a <= 36; a++) {
              const ang = (a / 36) * Math.PI * 2;
              const p = projectToScreen({ x: gr * Math.cos(ang), y: 0, z: gr * Math.sin(ang) }, cam, width, height);
              if (a === 0) ctx.moveTo(p.sx, p.sy);
              else ctx.lineTo(p.sx, p.sy);
            }
            ctx.stroke();
          });

          // Center of Curvature Pivot Pole
          const centerBase = projectToScreen({ x: 0, y: 0, z: 0 }, cam, width, height);
          const centerTop = projectToScreen({ x: 0, y: 10, z: 0 }, cam, width, height);
          if (centerBase.visible && centerTop.visible) {
            ctx.beginPath();
            ctx.moveTo(centerBase.sx, centerBase.sy);
            ctx.lineTo(centerTop.sx, centerTop.sy);
            ctx.strokeStyle = '#52525b';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerBase.sx, centerBase.sy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#71717a';
            ctx.fill();

            ctx.fillStyle = '#a1a1aa';
            ctx.font = '10px ui-monospace, monospace';
            ctx.fillText(`Center of Curvature (R = ${roadRadius}m)`, centerTop.sx + 6, centerTop.sy);
          }
          ctx.restore();
        }

        // 2. Draw 3D Banked Road Mesh
        // Divide circle into 48 segments
        const numSegments = 48;
        const rIn = roadRadius - (roadWidth / 2) * Math.cos(bankRad);
        const rOut = roadRadius + (roadWidth / 2) * Math.cos(bankRad);
        const hIn = 0;
        const hOut = roadWidth * Math.sin(bankRad);

        // Collect road quads and sort by camera depth
        interface RoadQuad {
          pts: Point3D[];
          isCenterLine: boolean;
          zDepth: number;
        }
        const quads: RoadQuad[] = [];

        for (let i = 0; i < numSegments; i++) {
          const a1 = (i / numSegments) * Math.PI * 2;
          const a2 = ((i + 1) / numSegments) * Math.PI * 2;

          const p1: Point3D = { x: rIn * Math.cos(a1), y: hIn, z: rIn * Math.sin(a1) };
          const p2: Point3D = { x: rOut * Math.cos(a1), y: hOut, z: rOut * Math.sin(a1) };
          const p3: Point3D = { x: rOut * Math.cos(a2), y: hOut, z: rOut * Math.sin(a2) };
          const p4: Point3D = { x: rIn * Math.cos(a2), y: hIn, z: rIn * Math.sin(a2) };

          const midZ = (p1.x + p2.x + p3.x + p4.x) / 4 * fwd.x +
                       (p1.y + p2.y + p3.y + p4.y) / 4 * fwd.y +
                       (p1.z + p2.z + p3.z + p4.z) / 4 * fwd.z;

          quads.push({ pts: [p1, p2, p3, p4], isCenterLine: false, zDepth: midZ });
        }

        // Draw Quads (sorted by depth)
        quads.forEach((q, idx) => {
          const s1 = projectToScreen(q.pts[0], cam, width, height);
          const s2 = projectToScreen(q.pts[1], cam, width, height);
          const s3 = projectToScreen(q.pts[2], cam, width, height);
          const s4 = projectToScreen(q.pts[3], cam, width, height);

          if (!s1.visible && !s2.visible && !s3.visible && !s4.visible) return;

          ctx.save();
          // Asphalt Surface
          ctx.beginPath();
          ctx.moveTo(s1.sx, s1.sy);
          ctx.lineTo(s2.sx, s2.sy);
          ctx.lineTo(s3.sx, s3.sy);
          ctx.lineTo(s4.sx, s4.sy);
          ctx.closePath();

          ctx.fillStyle = idx % 2 === 0 ? '#18181b' : '#222226';
          ctx.fill();
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Outer Raised Guardrail Barrier
          const b1 = projectToScreen({ ...q.pts[1], y: q.pts[1].y + 1.2 }, cam, width, height);
          const b2 = projectToScreen({ ...q.pts[2], y: q.pts[2].y + 1.2 }, cam, width, height);
          if (b1.visible && b2.visible) {
            ctx.beginPath();
            ctx.moveTo(s2.sx, s2.sy);
            ctx.lineTo(b1.sx, b1.sy);
            ctx.lineTo(b2.sx, b2.sy);
            ctx.lineTo(s3.sx, s3.sy);
            ctx.closePath();
            ctx.fillStyle = '#3f3f46';
            ctx.fill();
            ctx.strokeStyle = '#52525b';
            ctx.stroke();
          }

          // Inner Curb (red-and-white alternating)
          ctx.beginPath();
          ctx.moveTo(s1.sx, s1.sy);
          ctx.lineTo(s4.sx, s4.sy);
          ctx.strokeStyle = idx % 2 === 0 ? '#ef4444' : '#fafafa';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Center Dashed Lane Marker
          const a1 = (idx / numSegments) * Math.PI * 2;
          const a2 = ((idx + 0.6) / numSegments) * Math.PI * 2;
          const rMid = roadRadius;
          const hMid = (roadWidth / 2) * Math.sin(bankRad);
          const m1 = projectToScreen({ x: rMid * Math.cos(a1), y: hMid, z: rMid * Math.sin(a1) }, cam, width, height);
          const m2 = projectToScreen({ x: rMid * Math.cos(a2), y: hMid, z: rMid * Math.sin(a2) }, cam, width, height);
          if (m1.visible && m2.visible) {
            ctx.beginPath();
            ctx.moveTo(m1.sx, m1.sy);
            ctx.lineTo(m2.sx, m2.sy);
            ctx.strokeStyle = '#facc15'; // Highway Yellow
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          ctx.restore();
        });

        // 3. Draw Radius Dimension Line from Center to Car
        const centerPt = projectToScreen({ x: 0, y: carHeight, z: 0 }, cam, width, height);
        const carScrPt = projectToScreen(carWorldPos, cam, width, height);
        if (centerPt.visible && carScrPt.visible) {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(centerPt.sx, centerPt.sy);
          ctx.lineTo(carScrPt.sx, carScrPt.sy);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px ui-monospace, monospace';
          const midX = (centerPt.sx + carScrPt.sx) / 2;
          const midY = (centerPt.sy + carScrPt.sy) / 2;
          ctx.fillText(`R = ${roadRadius}m`, midX, midY - 6);
          ctx.restore();
        }

        // 4. Draw 3D Car Model
        // Car coordinate frame:
        // Forward tangent: (-sin psi, 0, cos psi)
        // Incline slope: (cos psi * cos theta, sin theta, sin psi * cos theta)
        // Incline normal: (-cos psi * sin theta, cos theta, -sin psi * sin theta)
        const carFwd: Point3D = { x: -Math.sin(carTrackAngle), y: 0, z: Math.cos(carTrackAngle) };
        const carSlope: Point3D = {
          x: Math.cos(carTrackAngle) * Math.cos(bankRad),
          y: Math.sin(bankRad),
          z: Math.sin(carTrackAngle) * Math.cos(bankRad),
        };
        const carNorm: Point3D = {
          x: -Math.cos(carTrackAngle) * Math.sin(bankRad),
          y: Math.cos(bankRad),
          z: -Math.sin(carTrackAngle) * Math.sin(bankRad),
        };

        const carLength = 4.2;
        const carW = 2.4;
        const carH = 1.2;

        // Construct 8 bounding vertices of the 3D car chassis
        const carCorners: Point3D[] = [];
        [-1, 1].forEach(fwdSign => {
          [-1, 1].forEach(sideSign => {
            [0, 1].forEach(upSign => {
              carCorners.push({
                x: carWorldPos.x + carFwd.x * (fwdSign * carLength * 0.5) + carSlope.x * (sideSign * carW * 0.5) + carNorm.x * (upSign * carH),
                y: carWorldPos.y + carFwd.y * (fwdSign * carLength * 0.5) + carSlope.y * (sideSign * carW * 0.5) + carNorm.y * (upSign * carH),
                z: carWorldPos.z + carFwd.z * (fwdSign * carLength * 0.5) + carSlope.z * (sideSign * carW * 0.5) + carNorm.z * (upSign * carH),
              });
            });
          });
        });

        // Project corners
        const scrCorners = carCorners.map(c => projectToScreen(c, cam, width, height));

        // Draw 3D Car Chassis
        ctx.save();
        const carThemeColor = isOptimum ? '#38bdf8' : isSafe ? '#22c55e' : '#ef4444';

        // Faces of the car box
        const faces = [
          [0, 1, 3, 2], // Left side
          [4, 5, 7, 6], // Right side
          [0, 1, 5, 4], // Bottom
          [2, 3, 7, 6], // Top roof
          [0, 2, 6, 4], // Back
          [1, 3, 7, 5], // Front
        ];

        faces.forEach(face => {
          ctx.beginPath();
          face.forEach((idx, i) => {
            const p = scrCorners[idx];
            if (i === 0) ctx.moveTo(p.sx, p.sy);
            else ctx.lineTo(p.sx, p.sy);
          });
          ctx.closePath();
          ctx.fillStyle = carThemeColor + '44';
          ctx.fill();
          ctx.strokeStyle = carThemeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // Headlight Beams casting onto the road ahead
        const lightLen = 14;
        const frontL: Point3D = {
          x: carWorldPos.x + carFwd.x * (carLength * 0.5 + lightLen) + carSlope.x * (-carW * 0.4),
          y: carWorldPos.y,
          z: carWorldPos.z + carFwd.z * (carLength * 0.5 + lightLen) + carSlope.z * (-carW * 0.4),
        };
        const frontR: Point3D = {
          x: carWorldPos.x + carFwd.x * (carLength * 0.5 + lightLen) + carSlope.x * (carW * 0.4),
          y: carWorldPos.y,
          z: carWorldPos.z + carFwd.z * (carLength * 0.5 + lightLen) + carSlope.z * (carW * 0.4),
        };
        const beamL = projectToScreen(frontL, cam, width, height);
        const beamR = projectToScreen(frontR, cam, width, height);
        const noseL = scrCorners[5];
        const noseR = scrCorners[7];

        if (beamL.visible && beamR.visible) {
          ctx.beginPath();
          ctx.moveTo(noseL.sx, noseL.sy);
          ctx.lineTo(beamL.sx, beamL.sy);
          ctx.lineTo(beamR.sx, beamR.sy);
          ctx.lineTo(noseR.sx, noseR.sy);
          ctx.closePath();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
          ctx.fill();
        }

        ctx.restore();

        // 5. Draw 3D Free Body Diagram (FBD) Vectors directly from Car Center
        const fbdScale = 4.0; // compact visual meter scale (~5 cm / ~45-50px)

        // A. Gravity mg (Downwards along -Y in 3D: Amber)
        draw3DVector(
          ctx,
          carWorldPos,
          { x: 0, y: -fbdScale, z: 0 },
          cam,
          width,
          height,
          '#f59e0b',
          'mg',
          2.0
        );

        // B. Normal Force N (Perpendicular to banked incline in 3D: Cyan)
        const nMag = fbdScale * (1 / Math.cos(bankRad));
        draw3DVector(
          ctx,
          carWorldPos,
          { x: carNorm.x * nMag, y: carNorm.y * nMag, z: carNorm.z * nMag },
          cam,
          width,
          height,
          '#06b6d4',
          'N',
          2.0
        );

        // C. Friction Force f (along slope: Pink)
        if (Math.abs(carSpeed - vOptimum) > 0.4 && frictionCoeff > 0.01) {
          // If speed > optimum: friction acts DOWN the slope towards inner curb
          // If speed < optimum: friction acts UP the slope towards outer barrier
          const fDir = carSpeed > vOptimum ? -1 : 1;
          const fLen = fbdScale * 0.7;
          draw3DVector(
            ctx,
            carWorldPos,
            {
              x: carSlope.x * (fDir * fLen),
              y: carSlope.y * (fDir * fLen),
              z: carSlope.z * (fDir * fLen),
            },
            cam,
            width,
            height,
            '#ec4899',
            carSpeed > vOptimum ? 'f_down' : 'f_up',
            1.8
          );
        }

        // D. Centripetal Acceleration ac (Horizontal towards Center: Emerald)
        const acMag = fbdScale * 0.85;
        draw3DVector(
          ctx,
          carWorldPos,
          { x: -Math.cos(carTrackAngle) * acMag, y: 0, z: -Math.sin(carTrackAngle) * acMag },
          cam,
          width,
          height,
          '#22c55e',
          'a_c',
          2.0
        );

        // 6. Safety Status Banner
        ctx.save();
        const statusText = isOptimum
          ? '🎯 OPTIMUM SPEED (Zero Friction Needed)'
          : isSafe
          ? '✅ SAFE TURNING (Friction Holds Vehicle)'
          : isSkidding
          ? '⚠️ SKIDDING OUTWARD (Speed Exceeds v_max)'
          : '⚠️ SLIPPING INWARD (Speed Below v_min)';

        const badgeColor = isOptimum ? '#38bdf8' : isSafe ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 11px ui-monospace, monospace';
        const bW = ctx.measureText(statusText).width + 24;
        ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(width / 2 - bW / 2, 16, bW, 28, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = badgeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(statusText, width / 2, 30);
        ctx.restore();
      } else {
        // --- 2D CROSS-SECTION INCLINE VIEW ---
        const originX = coordSys.originX;
        const originY = coordSys.originY;

        const roadLength = 240;
        const x1 = originX - roadLength * 0.45 * Math.cos(bankRad);
        const y1 = originY + roadLength * 0.45 * Math.sin(bankRad);
        const x2 = originX + roadLength * 0.55 * Math.cos(bankRad);
        const y2 = originY - roadLength * 0.55 * Math.sin(bankRad);

        // Incline wedge
        ctx.fillStyle = 'rgba(39, 39, 42, 0.6)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1 - 30, y1);
        ctx.lineTo(x2 + 30, y1);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x1, y1, 45, 0, -bankRad, true);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(`θ = ${bankingAngleDeg}°`, x1 + 52, y1 - 8);

        // Lateral position along incline slope [0 = bottom curb, 1 = top barrier]
        let inclineFraction = 0.5;
        if (isOptimum) {
          inclineFraction = 0.5;
        } else if (carSpeed > vOptimum) {
          const ratio = Math.min(1.0, (carSpeed - vOptimum) / Math.max(1, (isFinite(vMax) ? vMax - vOptimum : 20)));
          inclineFraction = 0.5 + ratio * 0.38; // slides up towards guardrail
        } else {
          const minDenom = Math.max(1, vOptimum - vMin);
          const ratio = Math.min(1.0, (vOptimum - carSpeed) / minDenom);
          inclineFraction = Math.max(0.12, 0.5 - ratio * 0.38); // slides down towards inner curb
        }

        const carMidX = x1 + (x2 - x1) * inclineFraction;
        const carMidY = y1 + (y2 - y1) * inclineFraction;

        ctx.save();
        ctx.translate(carMidX, carMidY);
        ctx.rotate(-bankRad);

        const carColor2D = isOptimum ? '#38bdf8' : isSafe ? '#22c55e' : '#ef4444';
        ctx.fillStyle = carColor2D;
        ctx.strokeStyle = '#fafafa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-24, -20, 48, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#09090b';
        ctx.fillRect(-12, -16, 24, 12);
        ctx.restore();

        // 2D FBD Vectors (~4-5 cm / 30-40px)
        const carCenter = new Vector2D(carMidX, carMidY - 10);
        VectorRenderer.drawScreenVector(ctx, carCenter, new Vector2D(0, 34), { color: '#f59e0b', lineWidth: 1.8, label: 'mg', headSize: 5.5 });
        const normalAngle = -bankRad - Math.PI / 2;
        VectorRenderer.drawScreenVector(ctx, carCenter, new Vector2D(Math.cos(normalAngle) * 40, Math.sin(normalAngle) * 40), { color: '#06b6d4', lineWidth: 2, label: 'N', headSize: 5.5 });

        if (Math.abs(carSpeed - vOptimum) > 0.4 && frictionCoeff > 0.01) {
          const fDir = carSpeed > vOptimum ? -1 : 1;
          const fAngle = -bankRad + (fDir > 0 ? -Math.PI : 0);
          VectorRenderer.drawScreenVector(ctx, carCenter, new Vector2D(Math.cos(fAngle) * 26, Math.sin(fAngle) * 26), { color: '#ec4899', lineWidth: 1.8, label: carSpeed > vOptimum ? 'f_down' : 'f_up', headSize: 5 });
        }

        VectorRenderer.drawScreenVector(ctx, carCenter, new Vector2D(-34, 0), { color: '#22c55e', lineWidth: 1.8, label: 'a_c', headSize: 5.5 });
      }
    }

    // SCENARIO 2: Vertical Circular Motion
    if (subMode === 'vertical_loop') {
      const centerX = coordSys.originX;
      const centerY = coordSys.originY;
      const rPx = loopRadius * coordSys.pixelsPerMeter;

      // Track outline
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizontal reference axis
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - rPx - 20, centerY);
      ctx.lineTo(centerX + rPx + 20, centerY);
      ctx.stroke();

      // Center pivot
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      let bobX = 0;
      let bobY = 0;
      let curV = 0;
      let curTension = 0;
      let isSlacked = false;

      const isSlackingRegime = loopRegime === 'slacking';
      const sinSlack = (bottomSpeed * bottomSpeed - 2 * gravity * loopRadius) / (3 * gravity * loopRadius);
      const thetaSlack = Math.asin(Math.max(-1, Math.min(1, sinSlack)));

      if (isSlackingRegime && slackStateRef.current.isSlacked) {
        isSlacked = true;
        const s = slackStateRef.current;
        const curX = s.projX + s.projVx * s.projT;
        const curY = s.projY + s.projVy * s.projT - 0.5 * gravity * s.projT * s.projT;
        bobX = centerX + curX * coordSys.pixelsPerMeter;
        bobY = centerY - curY * coordSys.pixelsPerMeter;
        curV = Math.hypot(s.projVx, s.projVy - gravity * s.projT);
        curTension = 0;
      } else {
        const theta = currentAngleRef.current;
        bobX = centerX + rPx * Math.cos(theta);
        bobY = centerY - rPx * Math.sin(theta);

        const currentHeight = loopRadius * (1 + Math.sin(theta));
        const vSq = Math.max(0, bottomSpeed * bottomSpeed - 2 * gravity * currentHeight);
        curV = Math.sqrt(vSq);
        // Correct physical tension: T = mv^2/R - mg sin(theta)
        curTension = Math.max(0, (1 * vSq) / loopRadius - 1 * gravity * Math.sin(theta));
      }

      // String line
      if (isSlacked) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const midX = (centerX + bobX) / 2;
        const midY = (centerY + bobY) / 2 + 15;
        ctx.quadraticCurveTo(midX, midY, bobX, bobY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = curTension > 0 ? '#fafafa' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
      }

      // Bob Circle
      ctx.fillStyle = isSlacked ? '#ef4444' : curTension > 0 ? '#22c55e' : '#f59e0b';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Velocity Vector (compact ~4-5 cm / 35px)
      const vDir = isSlacked
        ? Math.atan2(-(slackStateRef.current.projVy - gravity * slackStateRef.current.projT), slackStateRef.current.projVx)
        : (loopRegime === 'oscillating' && verticalOmegaRef.current < 0)
        ? currentAngleRef.current - Math.PI / 2
        : currentAngleRef.current + Math.PI / 2;

      const vMagnitude = Math.min(36, Math.max(16, curV * 1.6));
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(bobX, bobY),
        new Vector2D(Math.cos(vDir) * vMagnitude, -Math.sin(vDir) * vMagnitude),
        { color: '#22c55e', lineWidth: 1.8, label: `v = ${curV.toFixed(1)} m/s`, headSize: 5 }
      );

      // Tension Vector (compact ~4-5 cm / 36px max)
      if (!isSlacked && curTension > 0) {
        const maxExpectedT = (bottomSpeed * bottomSpeed) / loopRadius + gravity;
        const tRatio = Math.min(1.0, Math.max(0.2, curTension / Math.max(1, maxExpectedT)));
        const tLen = 16 + tRatio * 20;
        const tDx = centerX - bobX;
        const tDy = centerY - bobY;
        const tDist = Math.hypot(tDx, tDy) || 1;
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(bobX, bobY),
          new Vector2D((tDx / tDist) * tLen, (tDy / tDist) * tLen),
          { color: '#f59e0b', lineWidth: 2, label: `T = ${curTension.toFixed(1)} N`, headSize: 5 }
        );
      }

      // Weight mg Vector (compact 26px / ~3-4 cm)
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(bobX, bobY),
        new Vector2D(0, 26),
        { color: '#f43f5e', lineWidth: 1.8, label: 'mg', headSize: 5 }
      );

      // Slack point indicator
      if (isSlackingRegime) {
        const slackAngleDeg = ((thetaSlack * 180) / Math.PI).toFixed(0);
        const sx = centerX + rPx * Math.cos(thetaSlack);
        const sy = centerY - rPx * Math.sin(thetaSlack);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText(`Slack Point (θ = ${slackAngleDeg}°, T = 0)`, sx + 8, sy);
      }

      ctx.fillStyle = '#71717a';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`Bottom: u = ${bottomSpeed.toFixed(1)} m/s`, centerX + 8, centerY + rPx + 14);
      const vTopCalc = Math.sqrt(Math.max(0, bottomSpeed * bottomSpeed - 4 * gravity * loopRadius));
      ctx.fillText(`Top: v_top = ${vTopCalc.toFixed(1)} m/s`, centerX + 8, centerY - rPx - 8);

      // Regime Banner
      ctx.save();
      const bannerText = loopRegime === 'looping'
        ? '🔄 FULL VERTICAL LOOP (T_top ≥ 0, T_bottom - T_top = 6mg)'
        : loopRegime === 'oscillating'
        ? '↔️ OSCILLATION REGIME (u ≤ √(2gR), String Always Taut)'
        : isSlacked
        ? '⚠️ STRING SLACKED! (Bob leaves circle into parabolic path)'
        : '⚠️ SLACKING REGIME (String slacks in upper half: T → 0)';
      const bColor = loopRegime === 'looping' ? '#22c55e' : loopRegime === 'oscillating' ? '#38bdf8' : '#ef4444';
      ctx.font = 'bold 11px ui-monospace, monospace';
      const bw = ctx.measureText(bannerText).width + 24;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.strokeStyle = bColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width / 2 - bw / 2, 16, bw, 28, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = bColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bannerText, width / 2, 30);
      ctx.restore();
    }

    // SCENARIO 3: Conical Pendulum
    if (subMode === 'conical_pendulum') {
      const apexX = coordSys.originX;
      const apexY = coordSys.originY - 80;

      const rPx = coneR * coordSys.pixelsPerMeter;
      const hPx = coneH * coordSys.pixelsPerMeter;
      const baseCenterY = apexY + hPx;

      // Vertical axis (dashed gray line)
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.15)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(apexX, baseCenterY + 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Horizontal circular orbit (perspective ellipse)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.ellipse(apexX, baseCenterY, rPx, rPx * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Base center marker
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(apexX, baseCenterY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Radius line from base center to bob
      const phi = currentAngleRef.current;
      const bobX = apexX + rPx * Math.cos(phi);
      const bobY = baseCenterY + rPx * 0.35 * Math.sin(phi);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(apexX, baseCenterY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      ctx.setLineDash([]);

      // String line
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(apexX, apexY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Apex pivot point
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(apexX, apexY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Bob sphere
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Angle arc at apex
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(apexX, apexY, 30, Math.PI / 2 - coneRad, Math.PI / 2 + coneRad);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText(`θ = ${conicalAngleDeg}°`, apexX + 12, apexY + 45);
      ctx.fillText(`r = ${coneR.toFixed(2)}m`, (apexX + bobX) / 2, baseCenterY + 12);
      ctx.fillText(`h = ${coneH.toFixed(2)}m`, apexX - 45, (apexY + baseCenterY) / 2);

      // FBD Vectors on Bob (~4-5 cm):
      // 1. Tension vector T (along string towards apex, compact ~38px max)
      const tDx = apexX - bobX;
      const tDy = apexY - bobY;
      const tDist = Math.hypot(tDx, tDy) || 1;
      const tScale = Math.min(38, Math.max(18, (coneTension / 15) * 28));
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(bobX, bobY),
        new Vector2D((tDx / tDist) * tScale, (tDy / tDist) * tScale),
        { color: '#f59e0b', lineWidth: 2, label: `T = ${coneTension.toFixed(1)} N`, headSize: 5 }
      );

      // 2. Weight vector mg (straight down, 26px)
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(bobX, bobY),
        new Vector2D(0, 26),
        { color: '#f43f5e', lineWidth: 1.8, label: 'mg', headSize: 5 }
      );

      // 3. Centripetal Force vector Fc = m omega^2 r = T sin(theta) (towards base center, 26px)
      const cDx = apexX - bobX;
      const cDy = baseCenterY - bobY;
      const cLen = Math.hypot(cDx, cDy);
      if (cLen > 2) {
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(bobX, bobY),
          new Vector2D((cDx / cLen) * 26, (cDy / cLen) * 26),
          { color: '#06b6d4', lineWidth: 1.8, label: 'F_c', headSize: 5 }
        );
      }

      // 4. Tangential Velocity vector v (tangent to horizontal ellipse, 24px)
      const vTangentX = -Math.sin(phi);
      const vTangentY = 0.35 * Math.cos(phi);
      const vTanLen = Math.hypot(vTangentX, vTangentY) || 1;
      const vLinear = coneOmega * coneR;
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(bobX, bobY),
        new Vector2D((vTangentX / vTanLen) * 24, (vTangentY / vTanLen) * 24),
        { color: '#22c55e', lineWidth: 1.8, label: `v = ${vLinear.toFixed(1)} m/s`, headSize: 5 }
      );

      // Title Banner
      ctx.save();
      const bannerText = `🌀 CONICAL PENDULUM (Period T = 2π√(L cos θ / g) = ${conePeriod.toFixed(2)}s)`;
      ctx.font = 'bold 11px ui-monospace, monospace';
      const bw = ctx.measureText(bannerText).width + 24;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width / 2 - bw / 2, 16, bw, 28, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bannerText, width / 2, 30);
      ctx.restore();
    }
  }, [subMode, bankedViewMode, showTrajectoryGrid, bankingAngleDeg, roadRadius, carSpeed, frictionCoeff, loopRadius, bottomSpeed, conicalAngleDeg, bankRad, vOptimum, vMax, vMin, isSafe, isOptimum, isSkidding, isSlipping, coneR, coneH, coneRad, camYaw, camPitch, camDist, draw3DVector, projectToScreen, gravity, loopRegime, coneOmega, conePeriod, coneTension]);

  // Keep refs synchronized on each render
  renderSceneRef.current = renderScene;
  paramsRef.current = {
    subMode,
    carSpeed,
    roadRadius,
    bankingAngleDeg,
    frictionCoeff,
    loopRadius,
    bottomSpeed,
    conicalAngleDeg,
    pendulumLength,
    gravity,
    timeScale,
    coneOmega,
  };

  // Viewport auto-render on geometry change
  useEffect(() => {
    autoFitViewport();
    renderScene();
  }, [subMode, roadRadius, loopRadius, pendulumLength, autoFitViewport, renderScene]);

  // Setup Physics Loop once on mount
  useEffect(() => {
    const loop = new PhysicsLoop({
      update: (dt) => {
        const p = paramsRef.current;
        setCurrentTime((prev) => prev + dt * p.timeScale);

        if (p.subMode === 'banked_road') {
          currentAngleRef.current += (p.carSpeed / Math.max(1, p.roadRadius)) * dt * p.timeScale;
          if (currentAngleRef.current > Math.PI * 2) {
            currentAngleRef.current -= Math.PI * 2;
          }
        } else if (p.subMode === 'vertical_loop') {
          const u = p.bottomSpeed;
          const R = p.loopRadius;
          const g = p.gravity;
          const critOsc = Math.sqrt(2 * g * R);
          const critLoop = Math.sqrt(5 * g * R);

          if (u >= critLoop) {
            // Full Looping Regime: continuous rotation
            const theta = currentAngleRef.current;
            const currentHeight = R * (1 + Math.sin(theta));
            const vSq = Math.max(0.1, u * u - 2 * g * currentHeight);
            const curV = Math.sqrt(vSq);
            const omega = curV / R;
            currentAngleRef.current += omega * dt * p.timeScale;
            if (currentAngleRef.current > Math.PI * 1.5) {
              currentAngleRef.current -= Math.PI * 2;
            }
          } else if (u <= critOsc) {
            // Oscillating Regime: simple pendulum oscillation
            const theta = currentAngleRef.current;
            const alpha = -(g / R) * Math.cos(theta);
            let omega = verticalOmegaRef.current + alpha * dt * p.timeScale;
            const currentHeight = R * (1 + Math.sin(theta));
            const vSq = u * u - 2 * g * currentHeight;
            if (vSq <= 0) {
              omega = -Math.sign(omega || -alpha) * 0.05;
            } else {
              omega = Math.sign(omega) * (Math.sqrt(vSq) / R);
            }
            verticalOmegaRef.current = omega;
            currentAngleRef.current += omega * dt * p.timeScale;
          } else {
            // Slacking Regime: sqrt(2gR) < u < sqrt(5gR)
            const sinSlack = (u * u - 2 * g * R) / (3 * g * R);
            const thetaSlack = Math.asin(Math.max(-1, Math.min(1, sinSlack)));
            const vSlack = Math.sqrt(Math.max(0.1, g * R * sinSlack));

            if (!slackStateRef.current.isSlacked) {
              const theta = currentAngleRef.current;
              if (theta >= thetaSlack) {
                // String goes slack!
                slackStateRef.current = {
                  isSlacked: true,
                  slackTheta: thetaSlack,
                  slackV: vSlack,
                  projT: 0,
                  projX: R * Math.cos(thetaSlack),
                  projY: R * Math.sin(thetaSlack),
                  projVx: -vSlack * Math.sin(thetaSlack),
                  projVy: vSlack * Math.cos(thetaSlack),
                };
              } else {
                const currentHeight = R * (1 + Math.sin(theta));
                const vSq = Math.max(0.1, u * u - 2 * g * currentHeight);
                const curV = Math.sqrt(vSq);
                const omega = curV / R;
                currentAngleRef.current += omega * dt * p.timeScale;
              }
            } else {
              // Projectile free fall under gravity
              const s = slackStateRef.current;
              s.projT += dt * p.timeScale;
              const curX = s.projX + s.projVx * s.projT;
              const curY = s.projY + s.projVy * s.projT - 0.5 * g * s.projT * s.projT;
              const distFromCenter = Math.hypot(curX, curY);
              if (distFromCenter >= R && s.projT > 0.25) {
                // Resets after completing parabolic segment
                slackStateRef.current.isSlacked = false;
                currentAngleRef.current = -Math.PI / 2;
                verticalOmegaRef.current = u / R;
              }
            }
          }
        } else if (p.subMode === 'conical_pendulum') {
          currentAngleRef.current += p.coneOmega * dt * p.timeScale;
          if (currentAngleRef.current > Math.PI * 2) {
            currentAngleRef.current -= Math.PI * 2;
          }
        }
      },
      render: () => {
        renderSceneRef.current();
      },
    });

    loopRef.current = loop;
    loop.start();
    setIsRunning(true);

    return () => {
      loop.destroy();
    };
  }, []);

  const handleTogglePlay = () => {
    if (loopRef.current) {
      loopRef.current.toggle();
      setIsRunning(loopRef.current.getIsRunning());
    }
  };

  const handleStep = () => {
    if (loopRef.current) {
      loopRef.current.step(0.04);
    }
  };

  const handleTimeScaleChange = (scale: number) => {
    setTimeScale(scale);
    if (loopRef.current) {
      loopRef.current.setTimeScale(scale);
    }
  };

  const handleZoom = (factor: number) => {
    if (subMode === 'banked_road' && (bankedViewMode === '3d_orbit' || bankedViewMode === '3d_chase')) {
      setCamDist(d => Math.max(25, Math.min(250, d / factor)));
    } else {
      coordSysRef.current.zoom(factor);
    }
    renderScene();
  };

  // Mouse Orbit Drag for 3D Banked Road
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (subMode === 'banked_road' && bankedViewMode === '3d_orbit') {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current && subMode === 'banked_road' && bankedViewMode === '3d_orbit') {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      setCamYaw(y => y - dx * 0.008);
      setCamPitch(p => Math.max(0.08, Math.min(Math.PI / 2 - 0.08, p + dy * 0.008)));
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (subMode === 'banked_road' && (bankedViewMode === '3d_orbit' || bankedViewMode === '3d_chase')) {
      e.preventDefault();
      setCamDist(d => Math.max(25, Math.min(250, d + e.deltaY * 0.08)));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Circular Motion & Banking
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 05
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            3D centripetal highway dynamics, road banking safety envelopes, vertical loop-the-loop tension, and conical pendulums.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md border border-zinc-800">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'simulation'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded transition-colors ${
              activeTab === 'theory'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Derivations</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Sub-modes selector */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-md border border-zinc-800/80">
              <button
                onClick={() => switchSubMode('banked_road')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'banked_road' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3D Banked Road & Safety Envelope
              </button>
              <button
                onClick={() => switchSubMode('vertical_loop')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'vertical_loop' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Vertical Loop-the-Loop
              </button>
              <button
                onClick={() => switchSubMode('conical_pendulum')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'conical_pendulum' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Conical Pendulum
              </button>
            </div>

            {/* Viewport controls & 3D camera presets */}
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {subMode === 'banked_road' && (
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800 text-[11px]">
                  <button
                    onClick={() => setBankedViewMode('3d_orbit')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      bankedViewMode === '3d_orbit' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    3D Orbit
                  </button>
                  <button
                    onClick={() => setBankedViewMode('3d_chase')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      bankedViewMode === '3d_chase' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <RotateCw className="w-3 h-3 inline mr-1" />
                    3D Chase
                  </button>
                  <button
                    onClick={() => setBankedViewMode('2d_cross_section')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      bankedViewMode === '2d_cross_section' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    2D Incline
                  </button>
                </div>
              )}

              <button
                onClick={autoFitViewport}
                title="Fit apparatus"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit</span>
              </button>
              <button
                onClick={() => handleZoom(1.2)}
                title="Zoom in"
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                title="Zoom out"
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Canvas Viewport */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
                <canvas
                  ref={canvasRef}
                  width={820}
                  height={420}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onWheel={handleCanvasWheel}
                  className={`w-full h-[400px] block ${
                    subMode === 'banked_road' && bankedViewMode === '3d_orbit' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
                  }`}
                />

                {/* Telemetry pill */}
                <div className="absolute top-3 left-3 flex gap-2 font-mono text-[11px] text-zinc-300">
                  {subMode === 'banked_road' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                        v: {carSpeed.toFixed(1)} m/s
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-sky-400">
                        v_opt: {vOptimum.toFixed(1)} m/s
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                        θ: {bankingAngleDeg}°
                      </span>
                    </>
                  )}
                  {subMode === 'vertical_loop' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                        Regime: {loopRegime.toUpperCase()}
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300">
                        v_crit: {critLoop.toFixed(1)} m/s
                      </span>
                    </>
                  )}
                  {subMode === 'conical_pendulum' && (
                    <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-sky-400">
                      Period T: {conePeriod.toFixed(2)}s
                    </span>
                  )}
                </div>

                {/* 3D Orbit hint badge */}
                {subMode === 'banked_road' && bankedViewMode === '3d_orbit' && (
                  <div className="absolute top-3 right-3 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-[10px] font-mono text-zinc-400">
                    🖱️ Drag to Orbit 3D Camera • Scroll to Zoom
                  </div>
                )}

                {/* Grid toggle */}
                <div className="absolute bottom-3 left-3">
                  <button
                    onClick={() => setShowTrajectoryGrid(!showTrajectoryGrid)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      showTrajectoryGrid
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" />
                    Grid
                  </button>
                </div>
              </div>

              {/* Playback Controls */}
              <PlaybackControls
                isRunning={isRunning}
                onTogglePlay={handleTogglePlay}
                onReset={handleReset}
                onStep={handleStep}
                timeScale={timeScale}
                onTimeScaleChange={handleTimeScaleChange}
                currentTime={currentTime}
              />
            </div>

            {/* Right 4 cols: Parameter Controls & Formula HUD */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-3">
                <span className="text-xs font-medium text-zinc-300 block">
                  Parameters
                </span>

                {subMode === 'banked_road' && (
                  <>
                    <SliderControl
                      label="Vehicle Speed"
                      symbol="v"
                      value={carSpeed}
                      min={0}
                      max={40}
                      step={0.5}
                      unit="m/s"
                      onChange={setCarSpeed}
                      presets={[
                        { label: `Optimum (${vOptimum.toFixed(1)})`, value: Math.round(vOptimum) },
                        { label: 'Slow (5 m/s)', value: 5 },
                        { label: 'Fast (30 m/s)', value: 30 },
                      ]}
                    />
                    <SliderControl
                      label="Banking Angle"
                      symbol="θ"
                      value={bankingAngleDeg}
                      min={0}
                      max={45}
                      unit="°"
                      onChange={setBankingAngleDeg}
                      presets={[
                        { label: '0° (Flat)', value: 0 },
                        { label: '15°', value: 15 },
                        { label: '30°', value: 30 },
                      ]}
                    />
                    <SliderControl
                      label="Curve Radius"
                      symbol="R"
                      value={roadRadius}
                      min={20}
                      max={120}
                      unit="m"
                      onChange={setRoadRadius}
                    />
                    <SliderControl
                      label="Friction Coeff."
                      symbol="μ"
                      value={frictionCoeff}
                      min={0}
                      max={0.8}
                      step={0.05}
                      unit=""
                      onChange={setFrictionCoeff}
                      presets={[
                        { label: '0 (Frictionless)', value: 0 },
                        { label: '0.2 (Wet)', value: 0.2 },
                        { label: '0.5 (Dry)', value: 0.5 },
                      ]}
                    />
                  </>
                )}

                {subMode === 'vertical_loop' && (
                  <>
                    <SliderControl
                      label="Bottom Speed"
                      symbol="u"
                      value={bottomSpeed}
                      min={4}
                      max={25}
                      step={0.5}
                      unit="m/s"
                      onChange={setBottomSpeed}
                      presets={[
                        { label: `Loop (>${critLoop.toFixed(1)})`, value: Math.ceil(critLoop + 1) },
                        { label: `Oscillate (<${critOsc.toFixed(1)})`, value: Math.floor(critOsc - 1) },
                      ]}
                    />
                    <SliderControl
                      label="Circle Radius"
                      symbol="R"
                      value={loopRadius}
                      min={2}
                      max={10}
                      unit="m"
                      onChange={setLoopRadius}
                    />
                  </>
                )}

                {subMode === 'conical_pendulum' && (
                  <>
                    <SliderControl
                      label="Semi-Vertical Angle"
                      symbol="θ"
                      value={conicalAngleDeg}
                      min={10}
                      max={75}
                      unit="°"
                      onChange={setConicalAngleDeg}
                      presets={[
                        { label: '20°', value: 20 },
                        { label: '45°', value: 45 },
                        { label: '60°', value: 60 },
                      ]}
                    />
                    <SliderControl
                      label="String Length"
                      symbol="L"
                      value={pendulumLength}
                      min={1}
                      max={8}
                      step={0.5}
                      unit="m"
                      onChange={setPendulumLength}
                    />
                  </>
                )}
              </div>

              {/* Live Formula HUD */}
              {subMode === 'banked_road' && (
                <FormulaHUD
                  title="3D Banking Dynamics & Safety Bounds"
                  formulaLatex="v_{\text{opt}} = \sqrt{Rg\tan\theta}, \quad v_{\max} = \sqrt{Rg\frac{\tan\theta + \mu}{1 - \mu\tan\theta}}"
                  evaluatedValues={{
                    'Optimum Speed': `${vOptimum.toFixed(1)} m/s`,
                    'Safe Speed Range': `[${vMin.toFixed(1)}, ${isFinite(vMax) ? vMax.toFixed(1) : '∞'}] m/s`,
                    'Centripetal Accel': `${((carSpeed * carSpeed) / roadRadius).toFixed(2)} m/s²`,
                    'Friction Vector': isOptimum ? 'f = 0 (Zero tyre wear)' : carSpeed > vOptimum ? 'f acts DOWN banked slope' : 'f acts UP banked slope',
                    'Dynamic Status': isSafe ? 'SAFE (Within Envelope)' : isSkidding ? 'SKID OUTWARD' : 'SLIP INWARD',
                  }}
                  explanation="Allen Notes Pg 17-19: In 3D space, the normal force N tilts inward by angle θ. Its horizontal component N sin θ provides centripetal acceleration, while N cos θ supports vehicle weight mg."
                  noteSource="Allen Notes Pg 17-19"
                />
              )}

              {subMode === 'vertical_loop' && (
                <FormulaHUD
                  title="Vertical Circle Looping Criteria"
                  formulaLatex="u_{\text{loop}} \ge \sqrt{5gR}, \quad u_{\text{osc}} \le \sqrt{2gR}, \quad \Delta T = 6mg"
                  evaluatedValues={{
                    'Min Speed to Loop': `${critLoop.toFixed(2)} m/s`,
                    'Max Speed to Oscillate': `${critOsc.toFixed(2)} m/s`,
                    'Current Motion Regime': loopRegime.toUpperCase(),
                    'T_bottom - T_top': `${(6 * 1 * gravity).toFixed(1)} N`,
                  }}
                  explanation="Allen Notes Pg 15: If u < √(5gR), the string will slack (T = 0) in the upper hemisphere and the bob will enter parabolic free fall."
                  noteSource="Allen Notes Pg 15"
                />
              )}

              {subMode === 'conical_pendulum' && (
                <FormulaHUD
                  title="Conical Pendulum Dynamics"
                  formulaLatex="T_{\text{period}} = 2\pi\sqrt{\frac{L\cos\theta}{g}}, \quad T_{\text{string}} = \frac{mg}{\cos\theta}"
                  evaluatedValues={{
                    'Orbital Radius (r)': `${coneR.toFixed(2)} m`,
                    'Vertical Depth (h)': `${coneH.toFixed(2)} m`,
                    'Period of Revolution': `${conePeriod.toFixed(2)} s`,
                    'String Tension': `${coneTension.toFixed(1)} N`,
                  }}
                  explanation="Allen Notes Pg 15: The vertical component of tension balances gravity (T cos θ = mg) while the horizontal component provides centripetal force (T sin θ = mω²r)."
                  noteSource="Allen Notes Pg 15"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theory & Derivations */}
      {activeTab === 'theory' && <CircularMotionTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
