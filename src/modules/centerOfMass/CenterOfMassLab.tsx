import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { CenterOfMassTheory } from './CenterOfMassTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Layers } from 'lucide-react';

interface Particle {
  id: number;
  mass: number; // kg
  pos: Vector2D; // m
  color: string;
}

export interface CenterOfMassLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const CenterOfMassLab: React.FC<CenterOfMassLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [subMode, setSubMode] = useState<'cm_sandbox' | 'collision_lab' | 'variable_mass'>('cm_sandbox');

  // SubMode 1: CM Sandbox Config
  const [cmType, setCmType] = useState<'discrete' | 'cavity' | 'plank'>('discrete');
  
  // Discrete particles
  const [particles, setParticles] = useState<Particle[]>([
    { id: 1, mass: 2.0, pos: new Vector2D(-3, 2), color: '#38bdf8' },
    { id: 2, mass: 4.0, pos: new Vector2D(3, 3), color: '#22c55e' },
    { id: 3, mass: 1.5, pos: new Vector2D(-2, -3), color: '#f59e0b' },
    { id: 4, mass: 3.0, pos: new Vector2D(4, -2), color: '#ec4899' },
  ]);
  const [draggedParticleId, setDraggedParticleId] = useState<number | null>(null);

  // Cavity Disc
  const [discRadius, setDiscRadius] = useState<number>(4.0); // m
  const [cavityRadius, setCavityRadius] = useState<number>(1.5); // m
  const [cavityOffsetX, setCavityOffsetX] = useState<number>(1.8); // m

  // Man on a Plank
  const [manMass, setManMass] = useState<number>(60); // kg
  const [plankMass, setPlankMass] = useState<number>(180); // kg
  const [plankLength, setPlankLength] = useState<number>(8.0); // m
  const [manWalkProgress, setManWalkProgress] = useState<number>(0.0); // 0 to 1

  // SubMode 2: Collision Lab Config
  const [referenceFrame, setReferenceFrame] = useState<'lab' | 'cm'>('lab');
  const [massA, setMassA] = useState<number>(2.0); // kg
  const [massB, setMassB] = useState<number>(3.0); // kg
  const [initialVelA, setInitialVelA] = useState<number>(6.0); // m/s
  const [initialVelB, setInitialVelB] = useState<number>(-2.0); // m/s
  const [restitutionE, setRestitutionE] = useState<number>(0.8);
  const [impactParamB, setImpactParamB] = useState<number>(0.0); // m (0 = head-on)
  
  // Collision dynamic state
  const [simTime, setSimTime] = useState<number>(0);
  const [ballAPos, setBallAPos] = useState<Vector2D>(new Vector2D(-6, 0));
  const [ballBPos, setBallBPos] = useState<Vector2D>(new Vector2D(4, 0));
  const [ballAVel, setBallAVel] = useState<Vector2D>(new Vector2D(6, 0));
  const [ballBVel, setBallBVel] = useState<Vector2D>(new Vector2D(-2, 0));
  const [hasCollided, setHasCollided] = useState<boolean>(false);
  const [collisionPhase, setCollisionPhase] = useState<'pre' | 'deform' | 'post'>('pre');

  // SubMode 3: Variable Mass (Rocket Launch & Chain)
  const [varMassType, setVarMassType] = useState<'rocket' | 'chain'>('rocket');
  const [initialRocketMass, setInitialRocketMass] = useState<number>(1000); // kg
  const [fuelBurnRate, setFuelBurnRate] = useState<number>(12); // kg/s
  const [exhaustSpeed, setExhaustSpeed] = useState<number>(400); // m/s
  const [rocketTime, setRocketTime] = useState<number>(0);
  const [rocketAltitude, setRocketAltitude] = useState<number>(0);
  const [rocketVelocity, setRocketVelocity] = useState<number>(0);

  // Chain state
  const [chainTotalMass, setChainTotalMass] = useState<number>(6.0); // kg
  const [chainLength, setChainLength] = useState<number>(4.0); // m
  const [chainFallenFraction, setChainFallenFraction] = useState<number>(0.5);

  // Common Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Compute Discrete CM
  const totalMass = particles.reduce((acc, p) => acc + p.mass, 0);
  const cmX = totalMass > 0 ? particles.reduce((acc, p) => acc + p.mass * p.pos.x, 0) / totalMass : 0;
  const cmY = totalMass > 0 ? particles.reduce((acc, p) => acc + p.mass * p.pos.y, 0) / totalMass : 0;

  // Compute Cavity CM
  const discArea = Math.PI * discRadius * discRadius;
  const cavityArea = Math.PI * cavityRadius * cavityRadius;
  const remArea = discArea - cavityArea;
  const cavityCmX = remArea > 0 ? -(cavityArea * cavityOffsetX) / remArea : 0;

  // Compute Plank Shifts
  const deltaManRel = manWalkProgress * plankLength;
  const plankShiftX = -(manMass * deltaManRel) / (manMass + plankMass);
  const manGroundX = -plankLength / 2 + deltaManRel + plankShiftX;

  // Reset collision simulation
  const resetCollision = useCallback(() => {
    setSimTime(0);
    setBallAPos(new Vector2D(-6, impactParamB));
    setBallBPos(new Vector2D(4, 0));
    setBallAVel(new Vector2D(initialVelA, 0));
    setBallBVel(new Vector2D(initialVelB, 0));
    setHasCollided(false);
    setCollisionPhase('pre');
  }, [initialVelA, initialVelB, impactParamB]);

  // Reset Rocket simulation
  const resetRocket = useCallback(() => {
    setRocketTime(0);
    setRocketAltitude(0);
    setRocketVelocity(0);
  }, []);

  // Update physics in loop
  const updatePhysics = useCallback((dt: number) => {
    if (subMode === 'collision_lab') {
      const scaledDt = dt * playbackSpeed;
      setSimTime(t => t + scaledDt);

      setBallAPos(posA => {
        setBallBPos(posB => {
          setBallAVel(velA => {
            setBallBVel(velB => {
              const radiusA = 0.5 + 0.15 * Math.cbrt(massA);
              const radiusB = 0.5 + 0.15 * Math.cbrt(massB);
              const distVec = posB.sub(posA);
              const dist = distVec.mag();
              const minDist = radiusA + radiusB;

              if (dist <= minDist && !hasCollided) {
                // COLLISION EVENT
                setHasCollided(true);
                setCollisionPhase('deform');

                // Normal axis (n) along line of centers
                const n = distVec.normalize();
                // Tangent axis (t) perpendicular to n
                const t = new Vector2D(-n.y, n.x);

                // Project initial velocities onto n and t
                const uAn = velA.dot(n);
                const uAt = velA.dot(t);
                const uBn = velB.dot(n);
                const uBt = velB.dot(t);

                // Tangential components unchanged (smooth spheres)
                const vAt = uAt;
                const vBt = uBt;

                // Normal components resolve via 1D momentum conservation + restitution e
                const totalM = massA + massB;
                const vAn = ((massA - restitutionE * massB) * uAn + (1 + restitutionE) * massB * uBn) / totalM;
                const vBn = ((1 + restitutionE) * massA * uAn + (massB - restitutionE * massA) * uBn) / totalM;

                const resolvedA = n.scale(vAn).add(t.scale(vAt));
                const resolvedB = n.scale(vBn).add(t.scale(vBt));

                setBallAVel(resolvedA);
                setTimeout(() => setCollisionPhase('post'), 150);

                return resolvedB;
              }

              return velB;
            });
            return velA;
          });
          return posB.add(ballBVel.scale(scaledDt));
        });
        return posA.add(ballAVel.scale(scaledDt));
      });
    } else if (subMode === 'cm_sandbox' && cmType === 'plank') {
      if (isPlaying) {
        setManWalkProgress(prev => {
          const next = prev + 0.15 * dt * playbackSpeed;
          return next >= 1.0 ? 1.0 : next;
        });
      }
    } else if (subMode === 'variable_mass' && varMassType === 'rocket') {
      const scaledDt = dt * playbackSpeed;
      setRocketTime(t => {
        const nextTime = t + scaledDt;
        const dryMass = initialRocketMass * 0.35;
        const currentMass = Math.max(dryMass, initialRocketMass - fuelBurnRate * nextTime);
        const hasFuel = currentMass > dryMass;

        // Thrust force
        const thrust = hasFuel ? exhaustSpeed * fuelBurnRate : 0;
        const gravity = 9.8;
        const netAcc = hasFuel ? (thrust / currentMass) - gravity : -gravity;

        setRocketVelocity(v => {
          const newV = Math.max(0, v + netAcc * scaledDt);
          setRocketAltitude(h => Math.max(0, h + newV * scaledDt));
          return newV;
        });

        return nextTime;
      });
    }
  }, [subMode, playbackSpeed, hasCollided, massA, massB, restitutionE, ballAVel, ballBVel, cmType, isPlaying, varMassType, initialRocketMass, fuelBurnRate, exhaustSpeed]);

  useEffect(() => {
    loopRef.current = new PhysicsLoop({
      update: (dt) => updatePhysics(dt),
      render: () => {},
    });
    if (isPlaying) {
      loopRef.current.start();
    } else {
      loopRef.current.pause();
    }
    return () => {
      loopRef.current?.pause();
    };
  }, [isPlaying, updatePhysics]);

  // Canvas Mouse Interaction for Draggable Particles
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (subMode !== 'cm_sandbox' || cmType !== 'discrete') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const coord = new CoordinateSystem({
      pixelsPerMeter: 38 * zoomLevel,
      originX: canvas.width / 2,
      originY: canvas.height / 2,
    });
    const mouseCanvasPos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
    const mouseWorldPos = coord.screenToWorld(mouseCanvasPos);

    // Find closest particle within 0.8m
    let closestId: number | null = null;
    let minDist = 0.8;
    particles.forEach(p => {
      const d = p.pos.sub(mouseWorldPos).mag();
      if (d < minDist) {
        minDist = d;
        closestId = p.id;
      }
    });

    if (closestId !== null) {
      setDraggedParticleId(closestId);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedParticleId === null || subMode !== 'cm_sandbox' || cmType !== 'discrete') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const coord = new CoordinateSystem({
      pixelsPerMeter: 38 * zoomLevel,
      originX: canvas.width / 2,
      originY: canvas.height / 2,
    });
    const mouseCanvasPos = new Vector2D(e.clientX - rect.left, e.clientY - rect.top);
    const mouseWorldPos = coord.screenToWorld(mouseCanvasPos);

    setParticles(prev => prev.map(p => p.id === draggedParticleId ? { ...p, pos: mouseWorldPos } : p));
  };

  const handleCanvasMouseUp = () => {
    setDraggedParticleId(null);
  };

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const originY = subMode === 'variable_mass' && varMassType === 'rocket'
      ? height - 60
      : height / 2;

    const coord = new CoordinateSystem({
      pixelsPerMeter: 38 * zoomLevel,
      originX: width / 2,
      originY: originY,
    });
    coord.drawGrid(ctx, width, height);

    if (subMode === 'cm_sandbox') {
      if (cmType === 'discrete') {
        // Draw Mass Moments lines to CM
        const cmPos = new Vector2D(cmX, cmY);
        const cmScreen = coord.worldToScreen(cmPos);

        particles.forEach(p => {
          const pScreen = coord.worldToScreen(p.pos);
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(cmScreen.x, cmScreen.y);
          ctx.lineTo(pScreen.x, pScreen.y);
          ctx.strokeStyle = 'rgba(161, 161, 170, 0.4)';
          ctx.stroke();
          ctx.restore();
        });

        // Draw Particles
        particles.forEach(p => {
          const cPos = coord.worldToScreen(p.pos);
          const r = Math.max(10, Math.min(26, 10 + p.mass * 3.5));

          ctx.save();
          ctx.beginPath();
          ctx.arc(cPos.x, cPos.y, r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          // Text label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px ui-monospace, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`m${p.id}:${p.mass}kg`, cPos.x, cPos.y);

          // Position label below
          ctx.fillStyle = '#a1a1aa';
          ctx.font = '9px ui-monospace, monospace';
          ctx.fillText(`(${p.pos.x.toFixed(1)}, ${p.pos.y.toFixed(1)})`, cPos.x, cPos.y + r + 11);
          ctx.restore();
        });

        // Draw glowing CM Crosshair
        ctx.save();
        ctx.beginPath();
        ctx.arc(cmScreen.x, cmScreen.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cmScreen.x - 14, cmScreen.y);
        ctx.lineTo(cmScreen.x + 14, cmScreen.y);
        ctx.moveTo(cmScreen.x, cmScreen.y - 14);
        ctx.lineTo(cmScreen.x, cmScreen.y + 14);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`CM (${cmX.toFixed(2)}, ${cmY.toFixed(2)})`, cmScreen.x + 16, cmScreen.y - 8);
        ctx.restore();
      } else if (cmType === 'cavity') {
        // Draw Original Solid Disc
        const centerCanvas = coord.worldToScreen(new Vector2D(0, 0));
        const discRCanvas = discRadius * coord.pixelsPerMeter;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerCanvas.x, centerCanvas.y, discRCanvas, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();

        // Draw Cavity (Hole cut out)
        const cavityCenterCanvas = coord.worldToScreen(new Vector2D(cavityOffsetX, 0));
        const cavityRCanvas = cavityRadius * coord.pixelsPerMeter;

        ctx.beginPath();
        ctx.arc(cavityCenterCanvas.x, cavityCenterCanvas.y, cavityRCanvas, 0, Math.PI * 2);
        ctx.fillStyle = '#09090b'; // Cutout color matching background
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Mark Original Center (0, 0)
        ctx.beginPath();
        ctx.arc(centerCanvas.x, centerCanvas.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.fillStyle = '#71717a';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('Orig (0,0)', centerCanvas.x - 20, centerCanvas.y + 16);

        // Mark Cavity Center
        ctx.beginPath();
        ctx.arc(cavityCenterCanvas.x, cavityCenterCanvas.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.fillText(`Cavity (+${cavityOffsetX.toFixed(1)}, 0)`, cavityCenterCanvas.x - 25, cavityCenterCanvas.y + 16);

        // Mark Remaining CM
        const remCmCanvas = coord.worldToScreen(new Vector2D(cavityCmX, 0));
        ctx.beginPath();
        ctx.arc(remCmCanvas.x, remCmCanvas.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillText(`Shifted CM (${cavityCmX.toFixed(2)}, 0)`, remCmCanvas.x - 45, remCmCanvas.y - 14);

        ctx.restore();
      } else if (cmType === 'plank') {
        // Frictionless horizontal floor
        const floorY = -1.5;
        const leftFloor = coord.worldToScreen(new Vector2D(-8, floorY));
        const rightFloor = coord.worldToScreen(new Vector2D(8, floorY));

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(leftFloor.x, leftFloor.y);
        ctx.lineTo(rightFloor.x, rightFloor.y);
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Hatch lines for floor
        for (let x = -8; x <= 8; x += 0.8) {
          const pt = coord.worldToScreen(new Vector2D(x, floorY));
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 8, pt.y + 10);
          ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
          ctx.stroke();
        }

        // Draw Plank (Shifted by plankShiftX)
        const plankW = plankLength * coord.pixelsPerMeter;
        const plankH = 0.5 * coord.pixelsPerMeter;
        const plankCenterCanvas = coord.worldToScreen(new Vector2D(plankShiftX, floorY + 0.25));

        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillRect(plankCenterCanvas.x - plankW / 2, plankCenterCanvas.y - plankH / 2, plankW, plankH);
        ctx.strokeRect(plankCenterCanvas.x - plankW / 2, plankCenterCanvas.y - plankH / 2, plankW, plankH);

        // Plank Rollers
        [-plankLength * 0.35, 0, plankLength * 0.35].forEach(rx => {
          const rollerC = coord.worldToScreen(new Vector2D(plankShiftX + rx, floorY + 0.12));
          ctx.beginPath();
          ctx.arc(rollerC.x, rollerC.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#71717a';
          ctx.fill();
        });

        // Draw Man on Plank
        const manCanvas = coord.worldToScreen(new Vector2D(manGroundX, floorY + 0.5 + 0.7));
        ctx.beginPath();
        ctx.arc(manCanvas.x, manCanvas.y - 12, 10, 0, Math.PI * 2); // Head
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Torso & legs
        ctx.beginPath();
        ctx.moveTo(manCanvas.x, manCanvas.y - 2);
        ctx.lineTo(manCanvas.x, manCanvas.y + 16);
        ctx.lineTo(manCanvas.x - 8, manCanvas.y + 28);
        ctx.moveTo(manCanvas.x, manCanvas.y + 16);
        ctx.lineTo(manCanvas.x + 8, manCanvas.y + 28);
        ctx.stroke();

        // Stationary System Center of Mass line
        const cmGroundCanvas = coord.worldToScreen(new Vector2D(0, floorY + 2));
        const cmLineStart = coord.worldToScreen(new Vector2D(0, floorY - 0.5));
        const cmLineEnd = coord.worldToScreen(new Vector2D(0, floorY + 3.0));
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(cmLineStart.x, cmLineStart.y);
        ctx.lineTo(cmLineEnd.x, cmLineEnd.y);
        ctx.strokeStyle = '#f43f5e';
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillText('SYSTEM CM (STATIONARY: ΔXcm = 0)', cmGroundCanvas.x - 70, cmGroundCanvas.y - 10);

        ctx.restore();
      }
    } else if (subMode === 'collision_lab') {
      const radiusA = 0.5 + 0.15 * Math.cbrt(massA);
      const radiusB = 0.5 + 0.15 * Math.cbrt(massB);

      // System Center of Mass
      const totalM = massA + massB;
      const cmPosWorld = ballAPos.scale(massA).add(ballBPos.scale(massB)).scale(1 / totalM);
      const cmVelWorld = ballAVel.scale(massA).add(ballBVel.scale(massB)).scale(1 / totalM);

      // Effective positions and velocities depending on Reference Frame
      const effPosA = referenceFrame === 'cm' ? ballAPos.sub(cmPosWorld) : ballAPos;
      const effPosB = referenceFrame === 'cm' ? ballBPos.sub(cmPosWorld) : ballBPos;
      const effVelA = referenceFrame === 'cm' ? ballAVel.sub(cmVelWorld) : ballAVel;
      const effVelB = referenceFrame === 'cm' ? ballBVel.sub(cmVelWorld) : ballBVel;

      // Line of centers (Line of Impact n-axis)
      const diff = effPosB.sub(effPosA);
      const nDir = diff.mag() > 0.001 ? diff.normalize() : new Vector2D(1, 0);
      const tDir = new Vector2D(-nDir.y, nDir.x);

      // Draw n-axis and t-axis guides
      const midPoint = effPosA.add(effPosB).scale(0.5);
      const nStart = coord.worldToScreen(midPoint.sub(nDir.scale(4)));
      const nEnd = coord.worldToScreen(midPoint.add(nDir.scale(4)));
      const tStart = coord.worldToScreen(midPoint.sub(tDir.scale(3)));
      const tEnd = coord.worldToScreen(midPoint.add(tDir.scale(3)));

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(nStart.x, nStart.y);
      ctx.lineTo(nEnd.x, nEnd.y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tStart.x, tStart.y);
      ctx.lineTo(tEnd.x, tEnd.y);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.stroke();
      ctx.restore();

      // Labels for axes
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText('Line of Impact (n)', nEnd.x + 5, nEnd.y);

      // In Lab Frame: Draw moving CM marker with velocity vector
      if (referenceFrame === 'lab') {
        const cmScreen = coord.worldToScreen(cmPosWorld);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cmScreen.x, cmScreen.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cmScreen.x - 10, cmScreen.y);
        ctx.lineTo(cmScreen.x + 10, cmScreen.y);
        ctx.moveTo(cmScreen.x, cmScreen.y - 10);
        ctx.lineTo(cmScreen.x, cmScreen.y + 10);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#d8b4fe';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillText(`CM (v_cm=${cmVelWorld.mag().toFixed(1)}m/s)`, cmScreen.x - 35, cmScreen.y - 12);
        ctx.restore();

        const velCmScreen = new Vector2D(cmVelWorld.x * coord.pixelsPerMeter * 0.4, -cmVelWorld.y * coord.pixelsPerMeter * 0.4);
        VectorRenderer.drawScreenVector(ctx, cmScreen, velCmScreen, { color: '#a855f7', lineWidth: 2, label: 'v_cm' });
      } else {
        // In C-Frame: Draw fixed origin at center of mass
        const cmOriginScreen = coord.worldToScreen(new Vector2D(0, 0));
        ctx.save();
        ctx.beginPath();
        ctx.arc(cmOriginScreen.x, cmOriginScreen.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cmOriginScreen.x - 12, cmOriginScreen.y);
        ctx.lineTo(cmOriginScreen.x + 12, cmOriginScreen.y);
        ctx.moveTo(cmOriginScreen.x, cmOriginScreen.y - 12);
        ctx.lineTo(cmOriginScreen.x, cmOriginScreen.y + 12);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px ui-monospace, monospace';
        ctx.fillText('C-FRAME ORIGIN (CM at Rest: P_tot ≡ 0)', cmOriginScreen.x - 110, cmOriginScreen.y - 14);
        ctx.restore();
      }

      // Ball A
      const cPosA = coord.worldToScreen(effPosA);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cPosA.x, cPosA.y, radiusA * coord.pixelsPerMeter, 0, Math.PI * 2);
      ctx.fillStyle = collisionPhase === 'deform' ? '#fbbf24' : '#38bdf8';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`A: ${massA}kg`, cPosA.x, cPosA.y);
      ctx.restore();

      // Ball B
      const cPosB = coord.worldToScreen(effPosB);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cPosB.x, cPosB.y, radiusB * coord.pixelsPerMeter, 0, Math.PI * 2);
      ctx.fillStyle = collisionPhase === 'deform' ? '#fbbf24' : '#22c55e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`B: ${massB}kg`, cPosB.x, cPosB.y);
      ctx.restore();

      // Velocity Vectors
      const velAScreen = new Vector2D(effVelA.x * coord.pixelsPerMeter * 0.4, -effVelA.y * coord.pixelsPerMeter * 0.4);
      const velBScreen = new Vector2D(effVelB.x * coord.pixelsPerMeter * 0.4, -effVelB.y * coord.pixelsPerMeter * 0.4);
      VectorRenderer.drawScreenVector(ctx, cPosA, velAScreen, {
        color: '#38bdf8',
        lineWidth: 2,
        label: referenceFrame === 'lab' ? 'vA' : "v'A/c"
      });
      VectorRenderer.drawScreenVector(ctx, cPosB, velBScreen, {
        color: '#22c55e',
        lineWidth: 2,
        label: referenceFrame === 'lab' ? 'vB' : "v'B/c"
      });
    } else if (subMode === 'variable_mass') {
      if (varMassType === 'rocket') {
        const groundY = 0;
        // Ground line
        const gLeft = coord.worldToScreen(new Vector2D(-8, groundY));
        const gRight = coord.worldToScreen(new Vector2D(8, groundY));
        ctx.beginPath();
        ctx.moveTo(gLeft.x, gLeft.y);
        ctx.lineTo(gRight.x, gRight.y);
        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Rocket body
        const rocketPos = new Vector2D(0, rocketAltitude * 0.05); // scaled altitude
        const rCanvas = coord.worldToScreen(rocketPos);

        ctx.save();
        // Rocket cone & cylinder
        const rw = 24;
        const rh = 60;
        ctx.fillStyle = '#3f3f46';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fillRect(rCanvas.x - rw / 2, rCanvas.y - rh, rw, rh);
        ctx.strokeRect(rCanvas.x - rw / 2, rCanvas.y - rh, rw, rh);

        // Nosecone
        ctx.beginPath();
        ctx.moveTo(rCanvas.x - rw / 2, rCanvas.y - rh);
        ctx.lineTo(rCanvas.x, rCanvas.y - rh - 22);
        ctx.lineTo(rCanvas.x + rw / 2, rCanvas.y - rh);
        ctx.closePath();
        ctx.fillStyle = '#f43f5e';
        ctx.fill();
        ctx.stroke();

        // Exhaust flame if burning fuel
        const dryMass = initialRocketMass * 0.35;
        const currentMass = Math.max(dryMass, initialRocketMass - fuelBurnRate * rocketTime);
        if (currentMass > dryMass && isPlaying) {
          ctx.beginPath();
          ctx.moveTo(rCanvas.x - rw / 2 + 3, rCanvas.y);
          ctx.lineTo(rCanvas.x, rCanvas.y + 28 + Math.random() * 8);
          ctx.lineTo(rCanvas.x + rw / 2 - 3, rCanvas.y);
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 12;
          ctx.fill();
        }

        ctx.restore();

        // Thrust and Gravity vectors
        if (currentMass > dryMass) {
          const thrustScreen = new Vector2D(0, -2.5 * coord.pixelsPerMeter);
          VectorRenderer.drawScreenVector(ctx, rCanvas, thrustScreen, { color: '#22c55e', lineWidth: 3, label: 'F_thrust' });
        }
        const gravityScreen = new Vector2D(0, 1.5 * coord.pixelsPerMeter);
        VectorRenderer.drawScreenVector(ctx, rCanvas, gravityScreen, { color: '#ef4444', lineWidth: 2, label: 'W=mg' });
      } else {
        // Falling Chain
        const floorY = -1.5;
        const scaleTable = coord.worldToScreen(new Vector2D(0, floorY));
        ctx.save();
        // Weighing Scale
        ctx.fillStyle = '#27272a';
        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 2;
        ctx.fillRect(scaleTable.x - 70, scaleTable.y, 140, 25);
        ctx.strokeRect(scaleTable.x - 70, scaleTable.y, 140, 25);

        // Fallen links heap
        const fallenLinks = Math.floor(chainFallenFraction * 20);
        ctx.fillStyle = '#38bdf8';
        for (let i = 0; i < fallenLinks; i++) {
          ctx.beginPath();
          ctx.arc(scaleTable.x - 30 + (i % 6) * 12, scaleTable.y - 4 - Math.floor(i / 6) * 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hanging chain links
        const hangingFraction = 1 - chainFallenFraction;
        const topAnchor = coord.worldToScreen(new Vector2D(0, floorY + chainLength));
        const currentBottom = coord.worldToScreen(new Vector2D(0, floorY + chainLength * hangingFraction));

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(topAnchor.x, topAnchor.y);
        ctx.lineTo(currentBottom.x, currentBottom.y);
        ctx.stroke();

        ctx.restore();
      }
    }
  }, [subMode, cmType, particles, cmX, cmY, discRadius, cavityRadius, cavityOffsetX, cavityCmX, plankLength, plankShiftX, manGroundX, ballAPos, ballBPos, ballAVel, ballBVel, collisionPhase, massA, massB, zoomLevel, varMassType, rocketAltitude, rocketTime, initialRocketMass, fuelBurnRate, chainLength, chainFallenFraction, isPlaying, referenceFrame]);

  // Derived Calculations
  const collisionKEInitial = 0.5 * massA * initialVelA * initialVelA + 0.5 * massB * initialVelB * initialVelB;
  const collisionKECurrent = 0.5 * massA * ballAVel.magSq() + 0.5 * massB * ballBVel.magSq();
  const redMass = (massA * massB) / (massA + massB);
  const uRel = Math.abs(initialVelA - initialVelB);
  const collisionTheoLoss = 0.5 * redMass * (1 - restitutionE * restitutionE) * uRel * uRel;

  const collisionTotalM = massA + massB;
  const collisionCmVel = ballAVel.scale(massA).add(ballBVel.scale(massB)).scale(1 / collisionTotalM);
  const ballAVelRelCM = ballAVel.sub(collisionCmVel);
  const ballBVelRelCM = ballBVel.sub(collisionCmVel);
  const collisionTotalP = ballAVel.scale(massA).add(ballBVel.scale(massB));

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              CH 07
            </span>
            <h1 className="text-sm font-medium text-zinc-100">
              Center of Mass & Collisions Studio
            </h1>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Tab Selector */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'simulation'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Lab</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'theory'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Allen Theory</span>
            </button>
          </div>
        </div>

        {/* SubMode Pills for Simulation */}
        {activeTab === 'simulation' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubMode('cm_sandbox')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'cm_sandbox'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              CM Sandbox & Plank
            </button>
            <button
              onClick={() => {
                setSubMode('collision_lab');
                resetCollision();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'collision_lab'
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              1D & 2D Collision Studio
            </button>
            <button
              onClick={() => {
                setSubMode('variable_mass');
                resetRocket();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'variable_mass'
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Variable Mass & Rocket
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {activeTab === 'theory' ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <CenterOfMassTheory onNavigateChapter={onNavigateChapter} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas Viewport */}
          <div className="flex-1 relative flex flex-col bg-[#09090b] border-r border-zinc-800/80">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 backdrop-blur text-[11px] font-mono text-zinc-300">
                {subMode === 'cm_sandbox' && cmType === 'discrete' && 'Drag particles to observe dynamic mass moment balance'}
                {subMode === 'cm_sandbox' && cmType === 'cavity' && `Negative mass cavity shift: X_rem = ${cavityCmX.toFixed(2)}m`}
                {subMode === 'cm_sandbox' && cmType === 'plank' && `Plank Shift: ${plankShiftX.toFixed(2)}m | System CM Stationary`}
                {subMode === 'collision_lab' && (referenceFrame === 'lab' 
                  ? `🏢 Lab Frame (Ground) | v_cm = ${collisionCmVel.mag().toFixed(2)}m/s | P_tot = ${collisionTotalP.x.toFixed(1)}kg·m/s | e = ${restitutionE}`
                  : `🎯 C-Frame (Zero-Momentum) | Origin at CM | P_tot ≡ 0.00kg·m/s | e = ${restitutionE}`)}
                {subMode === 'variable_mass' && varMassType === 'rocket' && `Rocket Alt: ${rocketAltitude.toFixed(1)}m | Vel: ${rocketVelocity.toFixed(1)}m/s`}
                {subMode === 'variable_mass' && varMassType === 'chain' && `Scale Reading: 3λgx = ${(3 * (chainTotalMass/chainLength) * 9.8 * chainLength * chainFallenFraction).toFixed(1)} N (3x Weight)`}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full h-full cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full block"
              />
            </div>

            {/* Viewport Zoom Overlay */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 backdrop-blur z-10">
              <button
                onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.15))}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-zinc-400 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(2.0, z + 0.15))}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Playback Controls Footer */}
            <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
              <PlaybackControls
                isRunning={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onReset={() => {
                  setIsPlaying(false);
                  if (subMode === 'collision_lab') resetCollision();
                  if (subMode === 'variable_mass') resetRocket();
                  if (subMode === 'cm_sandbox' && cmType === 'plank') setManWalkProgress(0);
                }}
                onStep={() => updatePhysics(0.016)}
                timeScale={playbackSpeed}
                onTimeScaleChange={setPlaybackSpeed}
                currentTime={simTime}
              />
            </div>
          </div>

          {/* Right Sidebar Controls & HUD */}
          <div className="w-full lg:w-96 p-5 bg-zinc-950/60 overflow-y-auto space-y-5 border-l border-zinc-800/60">
            {subMode === 'cm_sandbox' && (
              <>
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Center of Mass Scenario
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
                    <button
                      onClick={() => setCmType('discrete')}
                      className={`py-1.5 rounded text-center transition-all ${
                        cmType === 'discrete'
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Discrete
                    </button>
                    <button
                      onClick={() => setCmType('cavity')}
                      className={`py-1.5 rounded text-center transition-all ${
                        cmType === 'cavity'
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Cavity Disc
                    </button>
                    <button
                      onClick={() => setCmType('plank')}
                      className={`py-1.5 rounded text-center transition-all ${
                        cmType === 'plank'
                          ? 'bg-zinc-800 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Man on Plank
                    </button>
                  </div>
                </div>

                {cmType === 'discrete' && (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-zinc-300">Particle Masses</span>
                    {particles.map((p) => (
                      <SliderControl
                        key={p.id}
                        label={`Particle m${p.id} (${p.color})`}
                        value={p.mass}
                        min={0.5}
                        max={8.0}
                        step={0.5}
                        unit="kg"
                        onChange={(newM) =>
                          setParticles(prev => prev.map(item => item.id === p.id ? { ...item, mass: newM } : item))
                        }
                      />
                    ))}
                  </div>
                )}

                {cmType === 'cavity' && (
                  <div className="space-y-4">
                    <SliderControl
                      label="Original Disc Radius (R)"
                      value={discRadius}
                      min={2.5}
                      max={6.0}
                      step={0.5}
                      unit="m"
                      onChange={setDiscRadius}
                    />
                    <SliderControl
                      label="Cavity Radius (r_c)"
                      value={cavityRadius}
                      min={0.5}
                      max={discRadius * 0.7}
                      step={0.1}
                      unit="m"
                      onChange={setCavityRadius}
                    />
                    <SliderControl
                      label="Cavity Offset X (d)"
                      value={cavityOffsetX}
                      min={0}
                      max={discRadius - cavityRadius}
                      step={0.1}
                      unit="m"
                      onChange={setCavityOffsetX}
                    />
                  </div>
                )}

                {cmType === 'plank' && (
                  <div className="space-y-4">
                    <SliderControl
                      label="Man Mass (m)"
                      value={manMass}
                      min={30}
                      max={120}
                      step={5}
                      unit="kg"
                      onChange={setManMass}
                    />
                    <SliderControl
                      label="Plank Mass (M)"
                      value={plankMass}
                      min={50}
                      max={400}
                      step={10}
                      unit="kg"
                      onChange={setPlankMass}
                    />
                    <SliderControl
                      label="Plank Length (L)"
                      value={plankLength}
                      min={4.0}
                      max={12.0}
                      step={0.5}
                      unit="m"
                      onChange={setPlankLength}
                    />
                    <SliderControl
                      label="Man Walking Progress"
                      value={manWalkProgress}
                      min={0}
                      max={1}
                      step={0.02}
                      unit="x L"
                      onChange={setManWalkProgress}
                    />
                  </div>
                )}
              </>
            )}

            {subMode === 'collision_lab' && (
              <div className="space-y-4">
                {/* Reference Frame Selector */}
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">Reference Frame</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {referenceFrame === 'lab' ? 'Ground Frame' : 'Zero-Momentum'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setReferenceFrame('lab')}
                      className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                        referenceFrame === 'lab'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                      }`}
                    >
                      🏢 Lab Frame (L)
                    </button>
                    <button
                      onClick={() => setReferenceFrame('cm')}
                      className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                        referenceFrame === 'cm'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                      }`}
                    >
                      🎯 C-Frame (CM)
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    {referenceFrame === 'lab'
                      ? 'Lab Frame: Observer at ground rest. CM moves with velocity v_cm.'
                      : 'C-Frame: Observer travels with CM. Total momentum is identically zero (P ≡ 0)!'}
                  </p>
                </div>

                <span className="text-xs font-semibold text-zinc-300">Collision Parameters</span>
                <SliderControl
                  label="Mass A (m1)"
                  value={massA}
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  unit="kg"
                  onChange={(v) => {
                    setMassA(v);
                    resetCollision();
                  }}
                />
                <SliderControl
                  label="Mass B (m2)"
                  value={massB}
                  min={0.5}
                  max={10.0}
                  step={0.5}
                  unit="kg"
                  onChange={(v) => {
                    setMassB(v);
                    resetCollision();
                  }}
                />
                <SliderControl
                  label="Initial Speed A (u1)"
                  value={initialVelA}
                  min={1.0}
                  max={12.0}
                  step={0.5}
                  unit="m/s"
                  onChange={(v) => {
                    setInitialVelA(v);
                    resetCollision();
                  }}
                />
                <SliderControl
                  label="Initial Speed B (u2)"
                  value={initialVelB}
                  min={-8.0}
                  max={4.0}
                  step={0.5}
                  unit="m/s"
                  onChange={(v) => {
                    setInitialVelB(v);
                    resetCollision();
                  }}
                />
                <SliderControl
                  label="Coefficient of Restitution (e)"
                  value={restitutionE}
                  min={0}
                  max={1}
                  step={0.05}
                  unit=""
                  onChange={(v) => {
                    setRestitutionE(v);
                    resetCollision();
                  }}
                />
                <SliderControl
                  label="Impact Parameter (b) [Oblique]"
                  value={impactParamB}
                  min={0}
                  max={1.5}
                  step={0.1}
                  unit="m"
                  onChange={(v) => {
                    setImpactParamB(v);
                    resetCollision();
                  }}
                />
              </div>
            )}

            {subMode === 'variable_mass' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
                  <button
                    onClick={() => {
                      setVarMassType('rocket');
                      resetRocket();
                    }}
                    className={`py-1.5 rounded text-center transition-all ${
                      varMassType === 'rocket'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Rocket Launch
                  </button>
                  <button
                    onClick={() => setVarMassType('chain')}
                    className={`py-1.5 rounded text-center transition-all ${
                      varMassType === 'chain'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Falling Chain
                  </button>
                </div>

                {varMassType === 'rocket' ? (
                  <>
                    <SliderControl
                      label="Initial Total Mass (m0)"
                      value={initialRocketMass}
                      min={400}
                      max={2000}
                      step={50}
                      unit="kg"
                      onChange={(v) => {
                        setInitialRocketMass(v);
                        resetRocket();
                      }}
                    />
                    <SliderControl
                      label="Fuel Burn Rate (dm/dt)"
                      value={fuelBurnRate}
                      min={4}
                      max={30}
                      step={2}
                      unit="kg/s"
                      onChange={(v) => {
                        setFuelBurnRate(v);
                        resetRocket();
                      }}
                    />
                    <SliderControl
                      label="Exhaust Speed (vr)"
                      value={exhaustSpeed}
                      min={200}
                      max={800}
                      step={50}
                      unit="m/s"
                      onChange={(v) => {
                        setExhaustSpeed(v);
                        resetRocket();
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SliderControl
                      label="Chain Mass (M)"
                      value={chainTotalMass}
                      min={2}
                      max={12}
                      step={1}
                      unit="kg"
                      onChange={setChainTotalMass}
                    />
                    <SliderControl
                      label="Chain Length (L)"
                      value={chainLength}
                      min={2}
                      max={8}
                      step={0.5}
                      unit="m"
                      onChange={setChainLength}
                    />
                    <SliderControl
                      label="Fallen Fraction (x / L)"
                      value={chainFallenFraction}
                      min={0.05}
                      max={0.95}
                      step={0.05}
                      unit=""
                      onChange={setChainFallenFraction}
                    />
                  </>
                )}
              </div>
            )}

            {/* Live Formula HUD */}
            <div className="pt-2">
              {subMode === 'cm_sandbox' && cmType === 'discrete' && (
                <FormulaHUD
                  title="Discrete Mass Center Coordinates"
                  formulaLatex="\vec{r}_{\text{cm}} = \frac{\sum m_i \vec{r}_i}{\sum m_i}"
                  evaluatedValues={{
                    Total_Mass: `${totalMass.toFixed(1)} kg`,
                    X_cm: `${cmX.toFixed(2)} m`,
                    Y_cm: `${cmY.toFixed(2)} m`,
                    Mass_Moments: 'Balanced',
                  }}
                />
              )}

              {subMode === 'cm_sandbox' && cmType === 'cavity' && (
                <FormulaHUD
                  title="Negative Mass Cavity Shift"
                  formulaLatex="X_{\text{rem}} = -\frac{r_c^2 \cdot d}{R^2 - r_c^2}"
                  evaluatedValues={{
                    Disc_Area: `${discArea.toFixed(1)} m²`,
                    Cavity_Area: `${cavityArea.toFixed(1)} m²`,
                    Cavity_Offset: `${cavityOffsetX.toFixed(1)} m`,
                    Shifted_CM: `${cavityCmX.toFixed(3)} m`,
                  }}
                />
              )}

              {subMode === 'cm_sandbox' && cmType === 'plank' && (
                <FormulaHUD
                  title="Plank Recoil & Invariant Centroid"
                  formulaLatex="\Delta x_p = -\frac{m L}{m + M}"
                  evaluatedValues={{
                    Man_Walked_Ground: `${(manGroundX - (-plankLength/2)).toFixed(2)} m`,
                    Plank_Recoil: `${plankShiftX.toFixed(2)} m`,
                    System_CM_Shift: '0.00 m (Preserved)',
                  }}
                />
              )}

              {subMode === 'collision_lab' && (
                <FormulaHUD
                  title={referenceFrame === 'lab' ? "Collision: Laboratory Frame (Ground)" : "Collision: Center of Mass Frame (C-Frame)"}
                  formulaLatex={
                    referenceFrame === 'lab'
                      ? "e = \\frac{v_2 - v_1}{u_1 - u_2}, \\quad v_{cm} = \\frac{m_1 u_1 + m_2 u_2}{m_1 + m_2}"
                      : "\\vec{P}_{\\text{C-frame}} = m_1 \\vec{v}'_{1/c} + m_2 \\vec{v}'_{2/c} \\equiv \\vec{0}, \\quad v'_{2/c} = -e u'_{2/c}"
                  }
                  evaluatedValues={
                    referenceFrame === 'lab'
                      ? {
                          Active_Frame: 'Laboratory Frame (Ground)',
                          Initial_KE: `${collisionKEInitial.toFixed(1)} J`,
                          v_CM: `${collisionCmVel.mag().toFixed(2)} m/s`,
                          Total_Momentum_P: `${collisionTotalP.x.toFixed(2)} kg·m/s`,
                          Total_KE: `${collisionKECurrent.toFixed(1)} J`,
                          Restitution_e: `${restitutionE.toFixed(2)}`,
                        }
                      : {
                          Active_Frame: 'C-Frame (Zero-Momentum)',
                          Net_Momentum_P: '0.00 kg·m/s (Strictly 0)',
                          vA_relative_CM: `${ballAVelRelCM.x.toFixed(2)} m/s`,
                          vB_relative_CM: `${ballBVelRelCM.x.toFixed(2)} m/s`,
                          Internal_KE_K_rel: `${(0.5 * redMass * Math.pow(ballAVel.sub(ballBVel).mag(), 2)).toFixed(1)} J`,
                          Theoretical_Loss: `${collisionTheoLoss.toFixed(1)} J`,
                        }
                  }
                />
              )}

              {subMode === 'variable_mass' && varMassType === 'rocket' && (
                <FormulaHUD
                  title="Tsiolkovsky Rocket Engine"
                  formulaLatex="v(t) = v_r \ln(m_0/m) - gt"
                  evaluatedValues={{
                    Thrust_Force: `${(exhaustSpeed * fuelBurnRate).toFixed(0)} N`,
                    Weight_Force: `${(Math.max(initialRocketMass * 0.35, initialRocketMass - fuelBurnRate * rocketTime) * 9.8).toFixed(0)} N`,
                    Altitude: `${rocketAltitude.toFixed(1)} m`,
                    Velocity: `${rocketVelocity.toFixed(1)} m/s`,
                  }}
                />
              )}

              {subMode === 'variable_mass' && varMassType === 'chain' && (
                <FormulaHUD
                  title="Chain Landing Force on Scale"
                  formulaLatex="N = W_{\text{static}} + F_{\text{thrust}} = 3\lambda gx"
                  evaluatedValues={{
                    Fallen_Length: `${(chainLength * chainFallenFraction).toFixed(2)} m`,
                    Static_Weight: `${((chainTotalMass/chainLength) * 9.8 * chainLength * chainFallenFraction).toFixed(1)} N`,
                    Dynamic_Thrust: `${(2 * (chainTotalMass/chainLength) * 9.8 * chainLength * chainFallenFraction).toFixed(1)} N`,
                    Total_Normal_N: `${(3 * (chainTotalMass/chainLength) * 9.8 * chainLength * chainFallenFraction).toFixed(1)} N`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
