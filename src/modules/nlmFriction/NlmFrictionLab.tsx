import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { FbdInspector, ForceVector } from '../../components/common/FbdInspector';
import { NlmGraphs } from '../../components/common/NlmGraphs';
import { NlmTheory } from './NlmTheory';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Activity, BookOpen, Sliders, Lock, Unlock, Zap, Crosshair } from 'lucide-react';

interface NlmFrictionLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const NlmFrictionLab: React.FC<NlmFrictionLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  // Navigation Tabs: 'simulation' | 'theory'
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Submode:
  // 'incline_repose' = Standard Block on Incline (Angle of Repose Sandbox)
  // 'accelerating_wedge' = Wedge on Wheels (Pseudo Force Lab)
  // 'connected_pulley' = Two Connected Masses over Pulley
  const [scenario, setScenario] = useState<'incline_repose' | 'accelerating_wedge' | 'connected_pulley'>('incline_repose');

  // Physical Parameters
  const [inclineAngleDeg, setInclineAngleDeg] = useState<number>(30);
  const [mass1, setMass1] = useState<number>(5); // kg (on incline)
  const [mass2, setMass2] = useState<number>(4); // kg (hanging mass in pulley mode)
  const [muStatic, setMuStatic] = useState<number>(0.5);
  const [muKinetic, setMuKinetic] = useState<number>(0.35);
  const [gravity, setGravity] = useState<number>(9.8);
  const [wedgeAcc, setWedgeAcc] = useState<number>(0); // a0: horizontal acceleration of wedge (m/s^2)

  // Visual toggles
  const [showFbdOverlay, setShowFbdOverlay] = useState<boolean>(true);
  const [showIsolatedFbd, setShowIsolatedFbd] = useState<boolean>(true);
  const [showGraphs, setShowGraphs] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showVariableDrawer, setShowVariableDrawer] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<'follow' | 'fixed'>('follow');

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1.0);

  // Incline string and block state
  // s1 = distance of block 1 from the top apex along the slope (in meters)
  const blockPosRef = useRef<number>(3.0);
  const blockVelRef = useRef<number>(0); // m/s, positive = moving DOWN incline
  const pulleyAngleRef = useRef<number>(0); // radians
  const wedgeOffsetRef = useRef<number>(0); // horizontal displacement of wedge on track (meters)
  const wedgeVelRef = useRef<number>(0); // horizontal velocity of wedge (m/s)
  const wedgeWheelAngleRef = useRef<number>(0); // radians of wheel rotation
  const baseOriginXRef = useRef<number>(110);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 34, originX: 110, originY: 390 }));
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Panning state
  const isPanningRef = useRef<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Physics Calculations
  const thetaRad = (inclineAngleDeg * Math.PI) / 180;
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);

  const inclineLengthMeters = 9.0;
  const totalStringLength = 6.8; // s1 + s2 = totalStringLength

  // Effective wedge acceleration (only active in accelerating_wedge mode)
  const a0 = scenario === 'accelerating_wedge' ? wedgeAcc : 0;

  // Pseudo force on block 1 in wedge frame: F_p = -m1 * a0 (horizontal, directed left if a0 > 0)
  // Components:
  // Normal into incline: m1 * a0 * sin(theta)
  // Parallel up incline: m1 * a0 * cos(theta)
  const normalForce = Math.max(0, mass1 * (gravity * cosTheta + a0 * sinTheta));
  const gravityParallel = mass1 * gravity * sinTheta; // down incline
  const pseudoParallel = mass1 * a0 * cosTheta; // up incline if a0 > 0
  const maxStaticFriction = muStatic * normalForce;
  const kineticFriction = muKinetic * normalForce;

  // Motion Evaluation
  let isSliding = false;
  let acceleration = 0; // positive = block 1 moves down incline
  let actualFriction = 0; // magnitude of active friction
  let frictionDir = 1; // +1 = points up incline, -1 = points down incline
  let tension = 0;

  if (scenario === 'incline_repose' || scenario === 'accelerating_wedge') {
    // Net driving force down the incline before friction
    const netDriveDown = gravityParallel - pseudoParallel;

    if (Math.abs(netDriveDown) > maxStaticFriction) {
      isSliding = true;
      frictionDir = Math.sign(netDriveDown) || 1;
      actualFriction = kineticFriction;
      acceleration = (netDriveDown - frictionDir * kineticFriction) / mass1;
    } else {
      isSliding = false;
      actualFriction = Math.abs(netDriveDown);
      frictionDir = Math.sign(netDriveDown) || 1;
      acceleration = 0;
    }
  } else {
    // Connected Pulley Machine
    // Block 1 on incline, Block 2 hanging
    // Driving force down incline: gravityParallel - pseudoParallel
    // Opposing force from hanging block 2: mass2 * gravity
    const netDriveDown = (gravityParallel - pseudoParallel) - (mass2 * gravity);

    if (Math.abs(netDriveDown) > maxStaticFriction) {
      isSliding = true;
      frictionDir = Math.sign(netDriveDown) || 1;
      actualFriction = kineticFriction;
      acceleration = (netDriveDown - frictionDir * kineticFriction) / (mass1 + mass2);
      tension = Math.max(0, mass2 * (gravity + acceleration));
    } else {
      isSliding = false;
      actualFriction = Math.abs(netDriveDown);
      frictionDir = Math.sign(netDriveDown) || 1;
      acceleration = 0;
      tension = mass2 * gravity;
    }
  }

  // Angle of repose & zero-slip conditions
  const angleOfReposeDeg = (Math.atan(muStatic) * 180) / Math.PI;
  const zeroSlipWedgeAcc = gravity * Math.tan(thetaRad);

  const autoFitViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coordSys = coordSysRef.current;
    const width = canvas.width;
    const height = canvas.height;

    const baseW = Math.max(6, inclineLengthMeters * Math.cos(thetaRad));
    const heightH = Math.max(5, inclineLengthMeters * Math.sin(thetaRad));

    const scaleX = (width - 150) / (baseW * 1.3);
    const scaleY = (height - 140) / (heightH * 1.35);
    const bestScale = Math.max(16, Math.min(52, Math.min(scaleX, scaleY)));

    coordSys.pixelsPerMeter = bestScale;
    const defaultX = scenario === 'accelerating_wedge' ? 140 : 85;
    baseOriginXRef.current = defaultX;
    coordSys.originX = defaultX;
    coordSys.originY = height - 60;
  }, [thetaRad, scenario]);

  // Main Canvas Rendering Routine
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const coordSys = coordSysRef.current;

    const wedgeX = scenario === 'accelerating_wedge' ? wedgeOffsetRef.current : 0;
    const wedgeVel = scenario === 'accelerating_wedge' ? wedgeVelRef.current : 0;

    // Adjust camera if in Follow Wedge mode
    if (scenario === 'accelerating_wedge' && cameraMode === 'follow') {
      coordSys.originX = baseOriginXRef.current - wedgeX * coordSys.pixelsPerMeter;
    }

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw clean coordinate grid
    coordSys.drawGrid(ctx, width, height, {
      gridColor: 'rgba(255, 255, 255, 0.03)',
      axisColor: 'rgba(161, 161, 170, 0.25)',
      labelColor: '#71717a',
    });

    // Incline Wedge dimensions
    const inclineHeightMeters = inclineLengthMeters * Math.sin(thetaRad);
    const inclineBaseMeters = inclineLengthMeters * Math.cos(thetaRad);

    const originScreen = coordSys.worldToScreen(new Vector2D(wedgeX, 0));
    const topScreen = coordSys.worldToScreen(new Vector2D(wedgeX, inclineHeightMeters));
    const rightScreen = coordSys.worldToScreen(new Vector2D(wedgeX + inclineBaseMeters, 0));
    const groundY = originScreen.y;

    // Draw Ground Track & Metric Ruler
    ctx.save();
    const wheelRadius = 9;
    const wheelY = groundY + wheelRadius;
    const railY = scenario === 'accelerating_wedge' ? wheelY + wheelRadius : groundY;

    // Main full-width rail / ground line across entire canvas
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, railY);
    ctx.lineTo(width, railY);
    ctx.stroke();

    if (scenario === 'accelerating_wedge') {
      // Secondary rail line for realistic steel track
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, railY + 3);
      ctx.lineTo(width, railY + 3);
      ctx.stroke();
    }

    // Metric distance marks and ties along ground rail in world coordinates
    const leftWorldX = coordSys.screenToWorld(new Vector2D(0, railY)).x;
    const rightWorldX = coordSys.screenToWorld(new Vector2D(width, railY)).x;
    const minWorldX = Math.floor(Math.min(leftWorldX, rightWorldX)) - 1;
    const maxWorldX = Math.ceil(Math.max(leftWorldX, rightWorldX)) + 1;

    const labelStep = coordSys.pixelsPerMeter > 28 ? 2 : 5;

    for (let xm = minWorldX; xm <= maxWorldX; xm++) {
      const sx = coordSys.worldToScreen(new Vector2D(xm, 0)).x;
      if (sx < -30 || sx > width + 30) continue;

      const isOrigin = xm === 0;
      const isMajor = xm % labelStep === 0;

      // Rail tick
      ctx.strokeStyle = isOrigin ? '#10b981' : isMajor ? '#71717a' : '#3f3f46';
      ctx.lineWidth = isOrigin ? 2 : isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(sx, railY);
      ctx.lineTo(sx, railY + (isOrigin ? 12 : isMajor ? 8 : 4));
      ctx.stroke();

      // Metric distance label on major ticks
      if (isMajor || isOrigin) {
        ctx.fillStyle = isOrigin ? '#34d399' : '#a1a1aa';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isOrigin ? '0m [START]' : `${xm}m`, sx, railY + (isOrigin ? 22 : 18));
      }

      // Ballast / tie hatch marks
      if (scenario === 'accelerating_wedge') {
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, railY + 4);
        ctx.lineTo(sx - 5, railY + 11);
        ctx.stroke();
      }
    }
    ctx.restore();

    // If Accelerating Wedge: Draw Rollers / Wheels underneath the wedge & Dynamic Vectors!
    if (scenario === 'accelerating_wedge') {
      ctx.save();
      const wheelPositions = [
        originScreen.x + 24,
        originScreen.x + (rightScreen.x - originScreen.x) * 0.5,
        rightScreen.x - 24,
      ];

      wheelPositions.forEach((wx) => {
        // Mechanical mounting bracket to wedge body
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(wx - 3, originScreen.y, 6, wheelRadius);

        // Wheel rim & tire
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(wx, wheelY, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotating spokes
        const wAngle = wedgeWheelAngleRef.current;
        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const spokeAngle = wAngle + (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(wx, wheelY);
          ctx.lineTo(
            wx + (wheelRadius - 2) * Math.cos(spokeAngle),
            wheelY + (wheelRadius - 2) * Math.sin(spokeAngle)
          );
          ctx.stroke();
        }

        // Axle hub
        ctx.fillStyle = '#fafafa';
        ctx.beginPath();
        ctx.arc(wx, wheelY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Wedge Acceleration Arrow on Ground
      if (Math.abs(a0) > 0.05) {
        const arrowStart = new Vector2D(originScreen.x + 35, railY + 22);
        const arrowLength = Math.min(85, Math.max(22, Math.abs(a0) * 7));
        const arrowDir = a0 > 0 ? 1 : -1;
        VectorRenderer.drawScreenVector(
          ctx,
          arrowStart,
          new Vector2D(arrowDir * arrowLength, 0),
          {
            color: '#c084fc',
            lineWidth: 2.5,
            label: `a₀ = ${a0.toFixed(1)} m/s²`,
            headSize: 8,
          }
        );
      }

      // Wedge Velocity Arrow on Ground
      if (Math.abs(wedgeVel) > 0.05) {
        const velStart = new Vector2D(originScreen.x + 35, railY + 40);
        const velLength = Math.min(95, Math.max(20, Math.abs(wedgeVel) * 6));
        const velDir = wedgeVel > 0 ? 1 : -1;
        VectorRenderer.drawScreenVector(
          ctx,
          velStart,
          new Vector2D(velDir * velLength, 0),
          {
            color: '#10b981',
            lineWidth: 2.5,
            label: `v_w = ${wedgeVel.toFixed(2)} m/s`,
            headSize: 8,
          }
        );
      }

      // Speed streaks behind rear heel when moving
      if (Math.abs(wedgeVel) > 0.6) {
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.lineWidth = 1.5;
        const streakDir = wedgeVel > 0 ? -1 : 1;
        const streakLen = Math.min(45, Math.abs(wedgeVel) * 4);
        ctx.beginPath();
        ctx.moveTo(originScreen.x + (streakDir > 0 ? 0 : -4), originScreen.y - 12);
        ctx.lineTo(originScreen.x + (streakDir > 0 ? 0 : -4) + streakDir * streakLen, originScreen.y - 12);
        ctx.moveTo(originScreen.x + (streakDir > 0 ? 0 : -4), originScreen.y - 32);
        ctx.lineTo(originScreen.x + (streakDir > 0 ? 0 : -4) + streakDir * (streakLen * 1.3), originScreen.y - 32);
        ctx.moveTo(originScreen.x + (streakDir > 0 ? 0 : -4), originScreen.y - 52);
        ctx.lineTo(originScreen.x + (streakDir > 0 ? 0 : -4) + streakDir * (streakLen * 0.8), originScreen.y - 52);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw Incline Wedge Body (Shaded, Beveled)
    ctx.save();
    const wedgeGradient = ctx.createLinearGradient(originScreen.x, topScreen.y, rightScreen.x, originScreen.y);
    wedgeGradient.addColorStop(0, '#1c1917');
    wedgeGradient.addColorStop(1, '#292524');

    ctx.fillStyle = wedgeGradient;
    ctx.beginPath();
    ctx.moveTo(originScreen.x, originScreen.y);
    ctx.lineTo(topScreen.x, topScreen.y);
    ctx.lineTo(rightScreen.x, originScreen.y);
    ctx.closePath();
    ctx.fill();

    // Wedge Ramp Surface Line
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(topScreen.x, topScreen.y);
    ctx.lineTo(rightScreen.x, originScreen.y);
    ctx.stroke();

    // Bottom toe stopper bumper
    ctx.save();
    ctx.translate(rightScreen.x, originScreen.y);
    ctx.rotate(thetaRad);
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-12, -14, 12, 14);
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -14, 12, 14);
    ctx.restore();

    // Incline Angle arc at bottom
    VectorRenderer.drawAngleArc(
      ctx,
      rightScreen,
      36,
      Math.PI - thetaRad,
      Math.PI,
      `θ=${inclineAngleDeg}°`,
      '#a8a29e'
    );
    ctx.restore();

    // Block 1 Position along incline: distance s1 from apex
    const s1 = Math.min(7.8, Math.max(0.9, blockPosRef.current));
    const blockCenterWorld = new Vector2D(
      wedgeX + s1 * Math.cos(thetaRad),
      inclineHeightMeters - s1 * Math.sin(thetaRad)
    );
    const blockCenterScreen = coordSys.worldToScreen(blockCenterWorld);

    // Block 1 Size
    const blockSizePx = Math.max(26, coordSys.pixelsPerMeter * 0.88);

    // Pulley Wheel & Connected System
    const pulleyRadiusPx = Math.max(12, coordSys.pixelsPerMeter * 0.38);
    const pulleyCenterScreen = new Vector2D(topScreen.x, topScreen.y);

    if (scenario === 'connected_pulley') {
      ctx.save();
      // Metallic Pulley Bracket mounted at apex
      ctx.fillStyle = '#78716c';
      ctx.fillRect(pulleyCenterScreen.x - 4, pulleyCenterScreen.y - 2, 8, 14);

      // Inextensible string constraint: s2 = totalStringLength - s1
      const s2 = Math.max(0.6, Math.min(5.2, totalStringLength - s1));
      const s2Px = s2 * coordSys.pixelsPerMeter;

      // Attachment point on Block 1
      const blockStringAttach = new Vector2D(
        blockCenterScreen.x - (blockSizePx / 2) * Math.cos(thetaRad),
        blockCenterScreen.y + (blockSizePx / 2) * Math.sin(thetaRad)
      );

      // Incline tangent on pulley rim
      const pulleyInclineTangent = new Vector2D(
        pulleyCenterScreen.x + pulleyRadiusPx * Math.sin(thetaRad),
        pulleyCenterScreen.y - pulleyRadiusPx * Math.cos(thetaRad)
      );

      // Vertical tangent on pulley rim (left side)
      const pulleyVerticalTangent = new Vector2D(
        pulleyCenterScreen.x - pulleyRadiusPx,
        pulleyCenterScreen.y
      );

      // Draw String: Block 1 -> Pulley -> Hanging Block 2
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(blockStringAttach.x, blockStringAttach.y);
      ctx.lineTo(pulleyInclineTangent.x, pulleyInclineTangent.y);
      ctx.stroke();

      // Arc over pulley
      ctx.beginPath();
      ctx.arc(
        pulleyCenterScreen.x,
        pulleyCenterScreen.y,
        pulleyRadiusPx,
        -Math.PI / 2 + thetaRad,
        Math.PI,
        true
      );
      ctx.stroke();

      // Hanging Block 2 position
      const m2CenterScreen = new Vector2D(
        pulleyVerticalTangent.x,
        pulleyCenterScreen.y + s2Px
      );

      // Vertical string
      ctx.beginPath();
      ctx.moveTo(pulleyVerticalTangent.x, pulleyVerticalTangent.y);
      ctx.lineTo(m2CenterScreen.x, m2CenterScreen.y);
      ctx.stroke();

      // Pulley Wheel Body
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(pulleyCenterScreen.x, pulleyCenterScreen.y, pulleyRadiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4 Rotating Radial Spokes
      const pAngle = pulleyAngleRef.current;
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const spokeAngle = pAngle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(pulleyCenterScreen.x, pulleyCenterScreen.y);
        ctx.lineTo(
          pulleyCenterScreen.x + pulleyRadiusPx * Math.cos(spokeAngle),
          pulleyCenterScreen.y + pulleyRadiusPx * Math.sin(spokeAngle)
        );
        ctx.stroke();
      }

      // Central axle
      ctx.fillStyle = '#fafaf9';
      ctx.beginPath();
      ctx.arc(pulleyCenterScreen.x, pulleyCenterScreen.y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Hanging Block 2
      const b2Size = Math.max(22, coordSys.pixelsPerMeter * 0.72);
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = isSliding ? '#f59e0b' : '#a8a29e';
      ctx.lineWidth = 1.5;
      ctx.fillRect(m2CenterScreen.x - b2Size / 2, m2CenterScreen.y, b2Size, b2Size);
      ctx.strokeRect(m2CenterScreen.x - b2Size / 2, m2CenterScreen.y, b2Size, b2Size);

      ctx.fillStyle = '#fafaf9';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${mass2}kg`, m2CenterScreen.x, m2CenterScreen.y + b2Size / 2);

      // Force vectors on Block 2 in overlay mode
      if (showFbdOverlay && tension > 0) {
        const tScale = Math.min(2.5, Math.max(0.8, coordSys.pixelsPerMeter * 0.05));
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(m2CenterScreen.x, m2CenterScreen.y),
          new Vector2D(0, -tension * tScale),
          { color: '#fbbf24', lineWidth: 2, label: `T=${tension.toFixed(1)}N`, headSize: 6 }
        );

        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(m2CenterScreen.x, m2CenterScreen.y + b2Size),
          new Vector2D(0, mass2 * gravity * tScale),
          { color: '#ef4444', lineWidth: 2, label: `m₂g`, headSize: 6 }
        );
      }
      ctx.restore();
    }

    // Draw Block 1 (on Incline)
    ctx.save();
    ctx.translate(blockCenterScreen.x, blockCenterScreen.y);
    ctx.rotate(thetaRad);

    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = isSliding ? '#f59e0b' : '#a8a29e';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-blockSizePx / 2, -blockSizePx, blockSizePx, blockSizePx);
    ctx.strokeRect(-blockSizePx / 2, -blockSizePx, blockSizePx, blockSizePx);

    // Subtle grip texture on block bottom
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1;
    for (let bx = -blockSizePx / 2 + 4; bx < blockSizePx / 2; bx += 6) {
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx - 3, -4);
      ctx.stroke();
    }

    ctx.fillStyle = '#fafaf9';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mass1}kg`, 0, -blockSizePx / 2);
    ctx.restore();

    // Draw Forces directly on the apparatus (FBD Overlay ~4-5 cm)
    if (showFbdOverlay) {
      const forceScale = Math.min(1.2, Math.max(0.4, coordSys.pixelsPerMeter * 0.025));

      // Normal Reaction N
      const normalAngle = -Math.PI / 2 + thetaRad;
      const normalVec = Vector2D.fromAngle(normalAngle, Math.min(42, Math.max(16, normalForce * forceScale)));
      VectorRenderer.drawScreenVector(ctx, blockCenterScreen, normalVec, {
        color: '#38bdf8',
        lineWidth: 1.8,
        label: `N=${normalForce.toFixed(1)}N`,
        headSize: 5.5,
      });

      // Gravity mg
      const gravityVec = new Vector2D(0, Math.min(40, Math.max(16, mass1 * gravity * forceScale)));
      VectorRenderer.drawScreenVector(ctx, blockCenterScreen, gravityVec, {
        color: '#ef4444',
        lineWidth: 1.8,
        label: `m₁g`,
        headSize: 5.5,
      });

      // Decomposed mg components
      const mgSinVec = Vector2D.fromAngle(thetaRad, Math.min(34, Math.max(14, gravityParallel * forceScale)));
      VectorRenderer.drawScreenVector(ctx, blockCenterScreen, mgSinVec, {
        color: '#78716c',
        lineWidth: 1.4,
        dashed: true,
        label: `m₁g sinθ`,
        headSize: 4.5,
      });

      // Pseudo force (in Accelerating Wedge mode)
      if (scenario === 'accelerating_wedge' && Math.abs(a0) > 0.01) {
        const pseudoMag = Math.abs(mass1 * a0);
        const pseudoDirAngle = a0 > 0 ? Math.PI : 0;
        const pseudoVec = Vector2D.fromAngle(pseudoDirAngle, Math.min(38, Math.max(14, pseudoMag * forceScale)));

        VectorRenderer.drawScreenVector(ctx, blockCenterScreen, pseudoVec, {
          color: '#c084fc',
          lineWidth: 2,
          label: `F_p`,
          subLabel: `(-m₁a₀)`,
          headSize: 6,
        });

        // Components of pseudo force
        const pParallelVec = Vector2D.fromAngle(thetaRad + Math.PI, Math.min(32, Math.max(12, pseudoParallel * forceScale)));
        VectorRenderer.drawScreenVector(ctx, blockCenterScreen, pParallelVec, {
          color: '#c084fc',
          lineWidth: 1.4,
          dashed: true,
          label: `m₁a₀ cosθ`,
          headSize: 4.5,
        });
      }

      // Friction Force
      if (actualFriction > 0.01) {
        const fAngle = frictionDir > 0 ? thetaRad + Math.PI : thetaRad;
        const frictionVec = Vector2D.fromAngle(fAngle, Math.min(36, Math.max(14, actualFriction * forceScale)));
        VectorRenderer.drawScreenVector(ctx, blockCenterScreen, frictionVec, {
          color: '#22c55e',
          lineWidth: 1.8,
          label: `${isSliding ? 'f_k' : 'f_s'}=${actualFriction.toFixed(1)}N`,
          headSize: 5.5,
        });
      }

      // Tension Force T (in connected pulley mode)
      if (scenario === 'connected_pulley' && tension > 0) {
        const tensionVec = Vector2D.fromAngle(thetaRad + Math.PI, tension * forceScale);
        VectorRenderer.drawScreenVector(ctx, blockCenterScreen, tensionVec, {
          color: '#fbbf24',
          lineWidth: 2,
          label: `T=${tension.toFixed(1)}N`,
          headSize: 8,
        });
      }
    }
  }, [
    thetaRad,
    inclineAngleDeg,
    scenario,
    showFbdOverlay,
    normalForce,
    mass1,
    mass2,
    gravity,
    a0,
    gravityParallel,
    pseudoParallel,
    actualFriction,
    frictionDir,
    isSliding,
    tension,
    cameraMode,
  ]);

  const handleReset = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.reset();
      loopRef.current.pause();
    }
    setIsRunning(false);
    setCurrentTime(0);
    blockPosRef.current = 3.0;
    blockVelRef.current = 0;
    pulleyAngleRef.current = 0;
    wedgeOffsetRef.current = 0;
    wedgeVelRef.current = 0;
    wedgeWheelAngleRef.current = 0;
    autoFitViewport();
    renderScene();
  }, [autoFitViewport, renderScene]);

  // Handle Fullscreen resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isFullscreen) {
      canvas.width = window.innerWidth - 60;
      canvas.height = window.innerHeight - 220;
    } else {
      canvas.width = 820;
      canvas.height = 460;
    }
    autoFitViewport();
    renderScene();
  }, [isFullscreen, autoFitViewport, renderScene]);

  // Handle Wheel Zooming & Panning
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    coordSysRef.current.zoom(factor, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    renderScene();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    panStartRef.current = { x: e.clientX, y: e.clientY };
    baseOriginXRef.current += dx;
    coordSysRef.current.pan(dx, dy);
    renderScene();
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  // Setup Simulation Loop
  useEffect(() => {
    handleReset();

    const loop = new PhysicsLoop({
      update: (dt, totalTime) => {
        setCurrentTime(totalTime);

        // Accelerating wedge horizontal integration
        if (scenario === 'accelerating_wedge') {
          wedgeVelRef.current += a0 * dt;
          wedgeOffsetRef.current += wedgeVelRef.current * dt;
          const wheelRadiusM = 0.25;
          wedgeWheelAngleRef.current += (wedgeVelRef.current / wheelRadiusM) * dt;
        }

        if (isSliding && acceleration !== 0) {
          blockVelRef.current += acceleration * dt;
          blockPosRef.current += blockVelRef.current * dt;

          const rMeters = 0.38;
          pulleyAngleRef.current += (blockVelRef.current / rMeters) * dt;

          // Boundaries
          if (blockPosRef.current >= 7.8) {
            blockPosRef.current = 7.8;
            blockVelRef.current = 0;
            if (scenario !== 'accelerating_wedge') {
              loop.pause();
              setIsRunning(false);
            }
          } else if (blockPosRef.current <= 0.9) {
            blockPosRef.current = 0.9;
            blockVelRef.current = 0;
            if (scenario !== 'accelerating_wedge') {
              loop.pause();
              setIsRunning(false);
            }
          }
        }
      },
      render: renderScene,
    });

    loopRef.current = loop;

    return () => {
      loop.destroy();
    };
  }, [
    inclineAngleDeg,
    mass1,
    mass2,
    muStatic,
    muKinetic,
    gravity,
    a0,
    scenario,
    isSliding,
    acceleration,
    handleReset,
    renderScene,
  ]);

  const handleTogglePlay = () => {
    if (loopRef.current) {
      if (scenario !== 'accelerating_wedge' && (blockPosRef.current >= 7.8 || blockPosRef.current <= 0.9)) {
        handleReset();
      }
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
    coordSysRef.current.zoom(factor);
    renderScene();
  };

  // Prepare Force Vectors for the Isolated FBD Inspector
  // Force directions in standard Cartesian degrees: 0 = right (+x), 90 = up (+y), 180 = left (-x), 270 = down (-y)
  const fbd1Forces: ForceVector[] = [
    {
      name: 'Normal Force',
      symbol: 'N',
      magnitude: normalForce,
      directionAngleDeg: 90 + inclineAngleDeg, // Perpendicular to incline
      color: '#38bdf8',
    },
    {
      name: 'Gravity',
      symbol: 'm₁g',
      magnitude: mass1 * gravity,
      directionAngleDeg: 270, // Straight down
      color: '#ef4444',
    },
  ];

  if (actualFriction > 0.01) {
    fbd1Forces.push({
      name: isSliding ? 'Kinetic Friction' : 'Static Friction',
      symbol: isSliding ? 'f_k' : 'f_s',
      magnitude: actualFriction,
      directionAngleDeg: frictionDir > 0 ? 180 - inclineAngleDeg : -inclineAngleDeg,
      color: '#22c55e',
    });
  }

  if (scenario === 'accelerating_wedge' && Math.abs(a0) > 0.01) {
    fbd1Forces.push({
      name: 'Pseudo Force',
      symbol: 'F_p',
      magnitude: Math.abs(mass1 * a0),
      directionAngleDeg: a0 > 0 ? 180 : 0,
      color: '#c084fc',
    });
  }

  if (scenario === 'connected_pulley' && tension > 0) {
    fbd1Forces.push({
      name: 'String Tension',
      symbol: 'T',
      magnitude: tension,
      directionAngleDeg: 180 - inclineAngleDeg,
      color: '#fbbf24',
    });
  }

  // Hanging Block 2 FBD
  const fbd2Forces: ForceVector[] = [
    {
      name: 'Tension',
      symbol: 'T',
      magnitude: tension,
      directionAngleDeg: 90, // Upward
      color: '#fbbf24',
    },
    {
      name: 'Gravity',
      symbol: 'm₂g',
      magnitude: mass2 * gravity,
      directionAngleDeg: 270, // Downward
      color: '#ef4444',
    },
  ];

  // Render Parameters Panel
  const renderParametersPanel = () => (
    <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-200 block">
          Simulation Parameters
        </span>
        <span className="font-mono text-[10px] text-zinc-400">
          Repose φ = {angleOfReposeDeg.toFixed(1)}°
        </span>
      </div>

      <SliderControl
        label="Incline Angle"
        symbol="θ"
        value={inclineAngleDeg}
        min={0}
        max={75}
        step={1}
        unit="°"
        onChange={setInclineAngleDeg}
        presets={[
          { label: '30°', value: 30 },
          { label: '37° (3-4-5)', value: 37 },
          { label: '45°', value: 45 },
          { label: '53° (3-4-5)', value: 53 },
        ]}
      />

      {scenario === 'accelerating_wedge' && (
        <SliderControl
          label="Wedge Horizontal Acc"
          symbol="a₀"
          value={wedgeAcc}
          min={-12}
          max={12}
          step={0.5}
          unit="m/s²"
          onChange={setWedgeAcc}
          presets={[
            { label: '0 (Rest)', value: 0 },
            { label: 'Zero Slip (g tanθ)', value: parseFloat(zeroSlipWedgeAcc.toFixed(1)) },
            { label: '+5 m/s²', value: 5 },
            { label: '+8 m/s²', value: 8 },
            { label: '-5 m/s²', value: -5 },
          ]}
        />
      )}

      <SliderControl
        label="Block 1 Mass"
        symbol="m₁"
        value={mass1}
        min={1}
        max={20}
        unit="kg"
        onChange={setMass1}
      />

      {scenario === 'connected_pulley' && (
        <SliderControl
          label="Hanging Mass"
          symbol="m₂"
          value={mass2}
          min={1}
          max={20}
          unit="kg"
          onChange={setMass2}
        />
      )}

      <SliderControl
        label="Static Friction"
        symbol="μ_s"
        value={muStatic}
        min={0.0}
        max={1.0}
        step={0.05}
        onChange={setMuStatic}
        presets={[
          { label: '0.2', value: 0.2 },
          { label: '0.5', value: 0.5 },
          { label: '0.8', value: 0.8 },
        ]}
      />

      <SliderControl
        label="Kinetic Friction"
        symbol="μ_k"
        value={muKinetic}
        min={0.0}
        max={Math.min(1.0, muStatic)}
        step={0.05}
        onChange={setMuKinetic}
      />

      <SliderControl
        label="Gravity"
        symbol="g"
        value={gravity}
        min={1}
        max={20}
        step={0.1}
        unit="m/s²"
        onChange={setGravity}
        presets={[
          { label: '9.8', value: 9.8 },
          { label: '10', value: 10 },
        ]}
      />
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#09090b] max-w-none p-4 overflow-y-auto' : ''}`}>
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Newton's Laws & Friction
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 04
            </span>
            {scenario === 'accelerating_wedge' && Math.abs(a0) > 0.01 && (
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 border border-purple-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Pseudo Force Active
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dynamic Free Body Diagrams, friction curves, angle of repose, accelerating wedge pseudo forces, and connected pulleys.
          </p>
        </div>

        {/* View Tabs & Fullscreen Studio Button */}
        <div className="flex items-center gap-2">
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
              <span>Theory & Notes</span>
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Open Fullscreen Studio'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow transition-colors"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen Studio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Simulation */}
      {activeTab === 'simulation' && (
        <div className="space-y-6">
          {/* Sub-scenarios Selector */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => { setScenario('incline_repose'); handleReset(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  scenario === 'incline_repose' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1. Angle of Repose Sandbox
              </button>
              <button
                onClick={() => { setScenario('accelerating_wedge'); handleReset(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  scenario === 'accelerating_wedge' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2. Accelerating Wedge (Pseudo Force)
              </button>
              <button
                onClick={() => { setScenario('connected_pulley'); handleReset(); }}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  scenario === 'connected_pulley' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3. Connected Pulley Machine
              </button>
            </div>

            {/* Viewport Zoom & Pan Controls */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {isFullscreen && (
                <button
                  onClick={() => setShowVariableDrawer(!showVariableDrawer)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showVariableDrawer ? 'Hide Variables' : 'Edit Variables'}</span>
                </button>
              )}
              {scenario === 'accelerating_wedge' && (
                <button
                  onClick={() => setCameraMode(cameraMode === 'follow' ? 'fixed' : 'follow')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    cameraMode === 'follow'
                      ? 'bg-purple-950/80 text-purple-200 border-purple-800 font-medium'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                  }`}
                  title="Toggle camera: Follow accelerating wedge or Fixed to ground track"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{cameraMode === 'follow' ? 'Camera: Track Wedge' : 'Camera: Fixed Ground'}</span>
                </button>
              )}
              <button
                onClick={autoFitViewport}
                title="Fit to screen"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit Apparatus</span>
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

          {/* Main Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Canvas Viewport */}
            <div className={`${isFullscreen && showVariableDrawer ? 'lg:col-span-8' : isFullscreen ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-3`}>
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
                <canvas
                  ref={canvasRef}
                  width={820}
                  height={460}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="w-full h-[420px] sm:h-[460px] block cursor-grab active:cursor-grabbing"
                />

                {/* Status Badges with Clear Dynamic Cues */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 font-mono text-[11px]">
                  {isSliding ? (
                    <span className="bg-amber-950/90 text-amber-300 border border-amber-800/80 px-2.5 py-1 rounded-md shadow flex items-center gap-1.5 font-semibold">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>SLIDING ({acceleration > 0 ? 'Down Incline' : 'Up Incline'}, a = {Math.abs(acceleration).toFixed(2)} m/s²)</span>
                    </span>
                  ) : (
                    <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-md shadow flex items-center gap-1.5 font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>STATIC EQUILIBRIUM (Rest, a = 0)</span>
                    </span>
                  )}

                  <span className="bg-zinc-900/90 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800">
                    Repose φ = {angleOfReposeDeg.toFixed(1)}°
                  </span>

                  {scenario === 'accelerating_wedge' && (
                    <>
                      <span className="bg-purple-950/90 text-purple-300 px-2.5 py-1 rounded-md border border-purple-800 flex items-center gap-1.5 font-semibold">
                        <span>Wedge: x = {wedgeOffsetRef.current.toFixed(1)}m</span>
                        <span className="text-purple-400/60">|</span>
                        <span>v = {wedgeVelRef.current.toFixed(2)} m/s</span>
                        <span className="text-purple-400/60">|</span>
                        <span>a₀ = {a0.toFixed(1)} m/s²</span>
                      </span>
                      {Math.abs(a0 - zeroSlipWedgeAcc) < 0.08 && (
                        <span className="bg-emerald-950/90 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800 shadow flex items-center gap-1 font-semibold">
                          ✨ Zero-Slip Equilibrium (a₀ = g tanθ)
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Equilibrium Hint banner if static */}
                {!isSliding && (
                  <div className="absolute top-14 left-3 bg-zinc-950/80 backdrop-blur px-2.5 py-1 rounded border border-zinc-850 text-[10px] text-zinc-400 font-mono">
                    Static friction fs ({actualFriction.toFixed(1)}N) cancels driving force. Increase θ &gt; φ to slide.
                  </div>
                )}

                {/* Bottom Canvas Toggles */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <button
                    onClick={() => setShowFbdOverlay(!showFbdOverlay)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      showFbdOverlay
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    Overlay Forces
                  </button>

                  <button
                    onClick={() => setShowIsolatedFbd(!showIsolatedFbd)}
                    className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
                      showIsolatedFbd
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                        : 'bg-zinc-900/80 text-zinc-500 border-zinc-800'
                    }`}
                  >
                    Isolated FBD Inspector
                  </button>

                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                    (Scroll to zoom • Drag to pan)
                  </span>
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

              {/* Dedicated Side-by-Side Isolated Free Body Diagrams (FBD) */}
              {showIsolatedFbd && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      Isolated Free Body Diagrams (FBD) & Equations
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      Page 125 Allen Notes Definition
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 ${scenario === 'connected_pulley' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-3`}>
                    {/* FBD of Block 1 */}
                    <FbdInspector
                      title="FBD"
                      bodyLabel="Block 1 on Incline"
                      mass={mass1}
                      forces={fbd1Forces}
                      netAcc={acceleration}
                      accDirection={acceleration > 0 ? '(Down Incline)' : acceleration < 0 ? '(Up Incline)' : '(At Rest)'}
                      equations={[
                        `Normal Axis: N = m₁(g cosθ + a₀ sinθ) = ${normalForce.toFixed(1)} N`,
                        `Incline Axis: m₁g sinθ - m₁a₀ cosθ = ${(gravityParallel - pseudoParallel).toFixed(1)} N`,
                        `Friction: ${isSliding ? 'f_k = μ_k N' : 'f_s = F_drive'} = ${actualFriction.toFixed(1)} N (Limit: ${maxStaticFriction.toFixed(1)} N)`,
                        scenario === 'connected_pulley' ? `Tension: T = ${tension.toFixed(1)} N` : `Net Force: ${(mass1 * acceleration).toFixed(1)} N`,
                      ]}
                      width={scenario === 'connected_pulley' ? 240 : 380}
                      height={180}
                    />

                    {/* FBD of Block 2 (in Pulley Mode) */}
                    {scenario === 'connected_pulley' && (
                      <FbdInspector
                        title="FBD"
                        bodyLabel="Hanging Block 2"
                        mass={mass2}
                        forces={fbd2Forces}
                        netAcc={acceleration}
                        accDirection={acceleration > 0 ? '(Moving Up)' : acceleration < 0 ? '(Moving Down)' : '(At Rest)'}
                        equations={[
                          `Vertical Axis: T - m₂g = m₂a`,
                          `Weight: m₂g = ${(mass2 * gravity).toFixed(1)} N`,
                          `Tension: T = ${tension.toFixed(1)} N`,
                          `Net Force: ${(mass2 * acceleration).toFixed(1)} N`,
                        ]}
                        width={240}
                        height={180}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Real-Time NLM Graphs (Toggleable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">
                    Friction & Acceleration Curves (Page 126 Notes)
                  </span>
                  <button
                    onClick={() => setShowGraphs(!showGraphs)}
                    className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    {showGraphs ? 'Hide Graphs' : 'Show Graphs'}
                  </button>
                </div>

                {showGraphs && (
                  <NlmGraphs
                    mass1={mass1}
                    gravity={gravity}
                    inclineAngleDeg={inclineAngleDeg}
                    muStatic={muStatic}
                    muKinetic={muKinetic}
                    currentTime={currentTime}
                    currentVelocity={blockVelRef.current}
                    acceleration={acceleration}
                  />
                )}
              </div>
            </div>

            {/* Sidebar Controls & Formula HUD */}
            {(!isFullscreen || showVariableDrawer) && (
              <div className="lg:col-span-4 space-y-3">
                {renderParametersPanel()}

                {/* Analytical Equations & HUD */}
                <FormulaHUD
                  title="Equations of Motion & Equilibrium"
                  formulaLatex="N = m_1(g\cos\theta + a_0\sin\theta), \quad \Sigma F_{\parallel} = m_1(g\sin\theta - a_0\cos\theta) - f"
                  evaluatedValues={{
                    'Normal Reaction (N)': `${normalForce.toFixed(1)} N`,
                    'Driving Force': `${(gravityParallel - pseudoParallel).toFixed(1)} N`,
                    'Active Friction': `${actualFriction.toFixed(1)} N`,
                    'Max Static Friction': `${maxStaticFriction.toFixed(1)} N`,
                    'Tension (T)': scenario === 'connected_pulley' ? `${tension.toFixed(1)} N` : 'N/A',
                    'Acceleration (a)': `${Math.abs(acceleration).toFixed(2)} m/s²`,
                  }}
                  explanation="Page 125 Notes: In a non-inertial frame, pseudo force -m a0 acts in the opposite direction. Setting a0 = g tanθ zeroes out the driving force along the incline!"
                  noteSource="Allen Notes Pg 125-126"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Theory & Notes */}
      {activeTab === 'theory' && <NlmTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
