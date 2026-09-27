import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { CalculusMotionGraphs } from './CalculusMotionGraphs';
import { Kinematics1DTheory } from './Kinematics1DTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Layers } from 'lucide-react';

interface Kinematics1DLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const Kinematics1DLab: React.FC<Kinematics1DLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [subMode, setSubMode] = useState<'motion_graphs' | 'gravity_vertical' | 'relative_pursuit'>('motion_graphs');

  // Submode 1: Motion Graphs Parameters
  const [x0, setX0] = useState<number>(0); // m
  const [velocity1D, setVelocity1D] = useState<number>(10); // m/s
  const [accel1D, setAccel1D] = useState<number>(-2); // m/s²
  const [totalDuration, setTotalDuration] = useState<number>(8); // s

  // Submode 2: Vertical Motion Under Gravity
  const [towerHeight, setTowerHeight] = useState<number>(30); // m
  const [verticalLaunchSpeed, setVerticalLaunchSpeed] = useState<number>(20); // m/s
  const [gravity1D, setGravity1D] = useState<number>(9.8); // m/s²

  // Submode 3: Relative Pursuit Parameters
  const [initialGap, setInitialGap] = useState<number>(40); // m
  const [speedA, setSpeedA] = useState<number>(5); // m/s
  const [accelA, setAccelA] = useState<number>(3); // m/s²
  const [speedB, setSpeedB] = useState<number>(15); // m/s
  const [accelB, setAccelB] = useState<number>(0); // m/s²

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [showTrajectoryGrid, setShowTrajectoryGrid] = useState<boolean>(true);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 6, originX: 60, originY: 340 }));
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Dynamic particle positions
  const posRef = useRef<Vector2D>(new Vector2D(0, 0));
  const velRef = useRef<Vector2D>(new Vector2D(0, 0));
  const posBRef = useRef<Vector2D>(new Vector2D(0, 0)); // for relative mode

  // 1. Analytical calculations for Submode 1 (Rectilinear Motion)
  const currentV1D = velocity1D + accel1D * currentTime;
  const currentX1D = x0 + velocity1D * currentTime + 0.5 * accel1D * currentTime * currentTime;
  const stoppingTime = accel1D < 0 && velocity1D > 0 ? -velocity1D / accel1D : null;
  const stoppingDistance = stoppingTime !== null ? velocity1D * stoppingTime + 0.5 * accel1D * stoppingTime * stoppingTime : null;

  // 2. Analytical calculations for Submode 2 (Vertical Gravity)
  const g = gravity1D;
  const uVert = verticalLaunchSpeed;
  const h0 = towerHeight;
  const apexTime = uVert > 0 ? uVert / g : 0;
  const apexHeight = h0 + (uVert > 0 ? (uVert * uVert) / (2 * g) : 0);
  const discriminant = uVert * uVert + 2 * g * h0;
  const flightTimeVert = (uVert + Math.sqrt(Math.max(0, discriminant))) / g;
  const impactSpeed = Math.sqrt(Math.max(0, discriminant));

  // 3. Analytical calculations for Submode 3 (Relative Pursuit)
  const uRel = speedA - speedB;
  const aRel = accelA - accelB;
  let catchTime: number | null = null;
  let minApproachDist: number | null = null;

  if (aRel === 0) {
    if (uRel > 0) {
      catchTime = initialGap / uRel;
    }
  } else {
    const discRel = uRel * uRel + 2 * aRel * initialGap;
    if (discRel >= 0) {
      const t1 = (-uRel + Math.sqrt(discRel)) / aRel;
      const t2 = (-uRel - Math.sqrt(discRel)) / aRel;
      const validTimes = [t1, t2].filter((t) => t > 0.05);
      if (validTimes.length > 0) {
        catchTime = Math.min(...validTimes);
      }
    }
    if (aRel > 0 && uRel < 0) {
      const tMinV = -uRel / aRel;
      minApproachDist = initialGap + uRel * tMinV + 0.5 * aRel * tMinV * tMinV;
    }
  }

  // Auto-fit function
  const autoFitViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coordSys = coordSysRef.current;
    const width = canvas.width;
    const height = canvas.height;

    if (subMode === 'motion_graphs') {
      let minX = x0;
      let maxX = x0;
      for (let i = 0; i <= 40; i++) {
        const t = (i / 40) * totalDuration;
        const xVal = x0 + velocity1D * t + 0.5 * accel1D * t * t;
        if (xVal < minX) minX = xVal;
        if (xVal > maxX) maxX = xVal;
      }
      const span = Math.max(30, maxX - minX + 20);
      const scale = Math.max(1.5, Math.min(18, (width - 120) / span));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = Math.max(50, 60 - Math.min(0, minX) * scale);
      coordSys.originY = height - 120;
    } else if (subMode === 'gravity_vertical') {
      const spanY = Math.max(35, apexHeight * 1.3 + 10);
      const scale = Math.max(2, Math.min(14, (height - 80) / spanY));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = width / 2 - 40;
      coordSys.originY = height - 50;
    } else {
      // Relative Pursuit
      const maxSpan = Math.max(70, initialGap * 2.2 + 30);
      const scale = Math.max(1.5, Math.min(12, (width - 120) / maxSpan));
      coordSys.pixelsPerMeter = scale;
      coordSys.originX = 70;
      coordSys.originY = height - 130;
    }
  }, [subMode, x0, velocity1D, accel1D, totalDuration, apexHeight, initialGap]);

  // Reset simulation
  const handleReset = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.reset();
      loopRef.current.pause();
    }
    setIsRunning(false);
    setCurrentTime(0);

    if (subMode === 'motion_graphs') {
      posRef.current = new Vector2D(x0, 0);
      velRef.current = new Vector2D(velocity1D, 0);
    } else if (subMode === 'gravity_vertical') {
      posRef.current = new Vector2D(0, towerHeight);
      velRef.current = new Vector2D(0, verticalLaunchSpeed);
    } else {
      posRef.current = new Vector2D(0, 0);
      velRef.current = new Vector2D(speedA, 0);
      posBRef.current = new Vector2D(initialGap, 0);
    }

    autoFitViewport();
    renderScene();
  }, [subMode, x0, velocity1D, towerHeight, verticalLaunchSpeed, speedA, initialGap, autoFitViewport]);

  // Main Canvas Render
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const coordSys = coordSysRef.current;

    // Clear background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    if (showTrajectoryGrid) {
      coordSys.drawGrid(ctx, width, height, {
        gridColor: 'rgba(255, 255, 255, 0.03)',
        axisColor: 'rgba(161, 161, 170, 0.2)',
        labelColor: '#71717a',
      });
    }

    // SCENARIO 1: Rectilinear 1D Motion
    if (subMode === 'motion_graphs') {
      const roadY = coordSys.originY;

      // Road asphalt surface
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, roadY - 18, width, 36);

      // Road boundary borders
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, roadY - 18);
      ctx.lineTo(width, roadY - 18);
      ctx.moveTo(0, roadY + 18);
      ctx.lineTo(width, roadY + 18);
      ctx.stroke();

      // Road center dashed line
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, roadY);
      ctx.lineTo(width, roadY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Position markings along track
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#71717a';
      ctx.textAlign = 'center';
      for (let m = -100; m <= 300; m += 10) {
        const sx = coordSys.originX + m * coordSys.pixelsPerMeter;
        if (sx > 10 && sx < width - 10) {
          ctx.strokeStyle = m === 0 ? '#38bdf8' : '#3f3f46';
          ctx.lineWidth = m === 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(sx, roadY + 18);
          ctx.lineTo(sx, roadY + 24);
          ctx.stroke();
          if (m % 20 === 0) {
            ctx.fillText(`${m}m`, sx, roadY + 35);
          }
        }
      }

      // Draw Vehicle / Runner at posRef.current.x
      const carWorldX = posRef.current.x;
      const carSx = coordSys.originX + carWorldX * coordSys.pixelsPerMeter;
      const carSy = roadY;

      // Sleek minimal vehicle chassis
      ctx.save();
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(carSx - 16, carSy - 10, 32, 16, 3);
      ctx.fill();
      ctx.stroke();

      // Cabin / windshield
      ctx.fillStyle = '#09090b';
      ctx.fillRect(carSx - 6, carSy - 7, 12, 10);

      // Wheels
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(carSx - 10, carSy + 7, 3, 0, Math.PI * 2);
      ctx.arc(carSx + 10, carSy + 7, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Velocity Vector Arrow (Green)
      const vVal = velRef.current.x;
      const vScale = 3.5;
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(carSx, carSy - 14),
        new Vector2D(vVal * vScale, 0),
        { color: '#22c55e', lineWidth: 2.5, label: `v = ${vVal.toFixed(1)} m/s`, headSize: 7 }
      );

      // Acceleration Vector Arrow (Indigo)
      if (Math.abs(accel1D) > 0.1) {
        const aScale = 8;
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(carSx, carSy + 24),
          new Vector2D(accel1D * aScale, 0),
          { color: '#818cf8', lineWidth: 2, label: `a = ${accel1D.toFixed(1)} m/s²`, headSize: 6 }
        );
      }
    }

    // SCENARIO 2: Vertical Motion Under Gravity
    if (subMode === 'gravity_vertical') {
      const groundY = coordSys.originY;
      const towerBaseX = coordSys.originX - 30;
      const towerTopY = coordSys.originY - towerHeight * coordSys.pixelsPerMeter;

      // Ground plane
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Tower structure (if h0 > 0)
      if (towerHeight > 0) {
        ctx.fillStyle = 'rgba(39, 39, 42, 0.7)';
        ctx.fillRect(towerBaseX - 30, towerTopY, 50, groundY - towerTopY);

        ctx.strokeStyle = '#52525b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(towerBaseX - 30, towerTopY, 50, groundY - towerTopY);

        // Tower cross-bracings
        ctx.strokeStyle = 'rgba(82, 82, 91, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let ty = towerTopY; ty < groundY - 15; ty += 25) {
          ctx.moveTo(towerBaseX - 30, ty);
          ctx.lineTo(towerBaseX + 20, ty + 25);
          ctx.moveTo(towerBaseX + 20, ty);
          ctx.lineTo(towerBaseX - 30, ty + 25);
        }
        ctx.stroke();

        // Tower height dimension tag
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`h₀ = ${towerHeight}m`, towerBaseX - 36, (towerTopY + groundY) / 2);
      }

      // Vertical flight guide line (dashed)
      const flightLineX = coordSys.originX + 20;
      ctx.save();
      ctx.strokeStyle = 'rgba(161, 161, 170, 0.25)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(flightLineX, groundY);
      ctx.lineTo(flightLineX, coordSys.originY - apexHeight * coordSys.pixelsPerMeter - 20);
      ctx.stroke();
      ctx.restore();

      // Apex Height Marker
      const apexScreenY = coordSys.originY - apexHeight * coordSys.pixelsPerMeter;
      ctx.save();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(flightLineX - 40, apexScreenY);
      ctx.lineTo(flightLineX + 40, apexScreenY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#eab308';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Apex H_max = ${apexHeight.toFixed(1)}m (v = 0)`, flightLineX + 46, apexScreenY + 3);

      // Ball / Projectile Body
      const ballY = posRef.current.y;
      const ballScreenY = coordSys.originY - ballY * coordSys.pixelsPerMeter;
      const ballVy = velRef.current.y;

      // Ball body
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(flightLineX, ballScreenY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Velocity vector arrow
      const vScale = 2.5;
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(flightLineX, ballScreenY),
        new Vector2D(0, -ballVy * vScale),
        {
          color: ballVy >= 0 ? '#22c55e' : '#f59e0b',
          lineWidth: 2.5,
          label: `v = ${ballVy.toFixed(1)} m/s`,
          headSize: 7,
        }
      );

      // Height readout tag
      ctx.fillStyle = '#fafafa';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`y = ${ballY.toFixed(1)}m`, flightLineX - 16, ballScreenY + 3);
    }

    // SCENARIO 3: Relative Pursuit & Overtaking
    if (subMode === 'relative_pursuit') {
      const roadY = coordSys.originY;

      // Two lanes
      const lane1Y = roadY - 16;
      const lane2Y = roadY + 16;

      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, roadY - 36, width, 72);

      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, roadY - 36);
      ctx.lineTo(width, roadY - 36);
      ctx.moveTo(0, roadY + 36);
      ctx.lineTo(width, roadY + 36);
      ctx.stroke();

      // Lane divider
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.2)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, roadY);
      ctx.lineTo(width, roadY);
      ctx.stroke();
      ctx.setLineDash([]);

      const carASx = coordSys.originX + posRef.current.x * coordSys.pixelsPerMeter;
      const carBSx = coordSys.originX + posBRef.current.x * coordSys.pixelsPerMeter;

      // Vehicle A (Pursuit Car - Emerald)
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(carASx - 16, lane1Y - 8, 32, 16, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#09090b';
      ctx.fillText('A', carASx - 3, lane1Y + 4);
      ctx.restore();

      // Vehicle B (Target Truck - Amber)
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(carBSx - 18, lane2Y - 9, 36, 18, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#09090b';
      ctx.fillText('B', carBSx - 3, lane2Y + 4);
      ctx.restore();

      // Separation dimension line
      const gap = posBRef.current.x - posRef.current.x;
      const dimY = roadY - 48;
      ctx.save();
      ctx.strokeStyle = gap <= 0 ? '#22c55e' : '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(carASx, lane1Y - 10);
      ctx.lineTo(carASx, dimY);
      ctx.moveTo(carBSx, lane2Y - 10);
      ctx.lineTo(carBSx, dimY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(carASx, dimY);
      ctx.lineTo(carBSx, dimY);
      ctx.stroke();

      const midDimX = (carASx + carBSx) / 2;
      const gapText = gap <= 0 ? `OVERTAKEN! (Lead = ${(-gap).toFixed(1)}m)` : `Gap Δx = ${gap.toFixed(1)}m`;
      ctx.font = '10px "JetBrains Mono", monospace';
      const gapW = ctx.measureText(gapText).width + 12;
      ctx.fillStyle = 'rgba(9, 9, 11, 0.9)';
      ctx.strokeStyle = gap <= 0 ? '#22c55e' : '#f59e0b';
      ctx.strokeRect(midDimX - gapW / 2, dimY - 8, gapW, 16);
      ctx.fillRect(midDimX - gapW / 2, dimY - 8, gapW, 16);

      ctx.fillStyle = gap <= 0 ? '#4ade80' : '#f59e0b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gapText, midDimX, dimY);
      ctx.restore();
    }
  }, [subMode, showTrajectoryGrid, towerHeight, apexHeight, x0, velocity1D, accel1D, gravity1D]);

  // Viewport and render auto-update
  useEffect(() => {
    autoFitViewport();
    renderScene();
  }, [subMode, x0, velocity1D, accel1D, towerHeight, verticalLaunchSpeed, gravity1D, initialGap, speedA, accelA, speedB, accelB, autoFitViewport, renderScene]);

  // Setup Physics Loop
  useEffect(() => {
    handleReset();

    const loop = new PhysicsLoop({
      update: (_dt, totalTime) => {
        setCurrentTime(totalTime);

        if (subMode === 'motion_graphs') {
          const px = x0 + velocity1D * totalTime + 0.5 * accel1D * totalTime * totalTime;
          const vx = velocity1D + accel1D * totalTime;
          posRef.current = new Vector2D(px, 0);
          velRef.current = new Vector2D(vx, 0);

          if (totalTime >= totalDuration) {
            loop.pause();
            setIsRunning(false);
          }
        } else if (subMode === 'gravity_vertical') {
          if (totalTime <= flightTimeVert) {
            const py = towerHeight + verticalLaunchSpeed * totalTime - 0.5 * gravity1D * totalTime * totalTime;
            const vy = verticalLaunchSpeed - gravity1D * totalTime;
            posRef.current = new Vector2D(0, Math.max(0, py));
            velRef.current = new Vector2D(0, vy);
          } else {
            posRef.current = new Vector2D(0, 0);
            velRef.current = new Vector2D(0, -impactSpeed);
            loop.pause();
            setIsRunning(false);
          }
        } else if (subMode === 'relative_pursuit') {
          const pxA = speedA * totalTime + 0.5 * accelA * totalTime * totalTime;
          const pxB = initialGap + speedB * totalTime + 0.5 * accelB * totalTime * totalTime;
          posRef.current = new Vector2D(pxA, 0);
          velRef.current = new Vector2D(speedA + accelA * totalTime, 0);
          posBRef.current = new Vector2D(pxB, 0);

          if (catchTime !== null && totalTime >= catchTime + 2.5) {
            loop.pause();
            setIsRunning(false);
          } else if (totalTime >= 15) {
            loop.pause();
            setIsRunning(false);
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
    subMode,
    x0,
    velocity1D,
    accel1D,
    totalDuration,
    towerHeight,
    verticalLaunchSpeed,
    gravity1D,
    flightTimeVert,
    impactSpeed,
    speedA,
    accelA,
    initialGap,
    speedB,
    accelB,
    catchTime,
    handleReset,
    renderScene,
  ]);

  const handleTogglePlay = () => {
    if (loopRef.current) {
      const isFinished =
        subMode === 'motion_graphs'
          ? currentTime >= totalDuration
          : subMode === 'gravity_vertical'
          ? currentTime >= flightTimeVert
          : currentTime >= 15;

      if (isFinished) {
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

  const handleZoom = (factor: number) => {
    coordSysRef.current.zoom(factor);
    renderScene();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Kinematics in 1D & Calculus
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 02
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rectilinear motion, synchronous calculus graphs (x-t, v-t, a-t), vertical gravity & relative pursuit.
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
                onClick={() => { setSubMode('motion_graphs'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'motion_graphs' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Calculus & Motion Graphs
              </button>
              <button
                onClick={() => { setSubMode('gravity_vertical'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'gravity_vertical' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Vertical Motion Under Gravity
              </button>
              <button
                onClick={() => { setSubMode('relative_pursuit'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'relative_pursuit' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Relative 1D Pursuit & Overtake
              </button>
            </div>

            {/* Viewport controls */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <button
                onClick={autoFitViewport}
                title="Fit full motion path"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Fit Graph</span>
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
            {/* Left 8 cols: Canvas Viewport & Calculus Graphs */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
                <canvas
                  ref={canvasRef}
                  width={820}
                  height={380}
                  className="w-full h-[320px] block"
                />

                {/* Telemetry pill */}
                <div className="absolute top-3 left-3 flex gap-2 font-mono text-[11px] text-zinc-300">
                  <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                    t: {currentTime.toFixed(2)}s
                  </span>
                  {subMode === 'motion_graphs' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                        x: {currentX1D.toFixed(1)}m
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                        v: {currentV1D.toFixed(1)} m/s
                      </span>
                    </>
                  )}
                  {subMode === 'gravity_vertical' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                        y: {posRef.current.y.toFixed(1)}m
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                        v: {velRef.current.y.toFixed(1)} m/s
                      </span>
                    </>
                  )}
                  {subMode === 'relative_pursuit' && (
                    <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-sky-400">
                      v_rel: {(velRef.current.x - (speedB + accelB * currentTime)).toFixed(1)} m/s
                    </span>
                  )}
                </div>

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
                onTimeScaleChange={setTimeScale}
                currentTime={currentTime}
              />

              {/* Synchronized Calculus Graphs for Motion Graphs mode */}
              {subMode === 'motion_graphs' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">
                      Synchronized Motion Graphs (Calculus Connections)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Slope(x-t) = v | Area(v-t) = Δx | Area(a-t) = Δv
                    </span>
                  </div>
                  <CalculusMotionGraphs
                    x0={x0}
                    u={velocity1D}
                    a={accel1D}
                    currentTime={currentTime}
                    totalDuration={totalDuration}
                  />
                </div>
              )}
            </div>

            {/* Right 4 cols: Parameter Controls & Formula HUD */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-3">
                <span className="text-xs font-medium text-zinc-300 block">
                  Parameters
                </span>

                {subMode === 'motion_graphs' && (
                  <>
                    <SliderControl
                      label="Initial Position"
                      symbol="x₀"
                      value={x0}
                      min={-30}
                      max={50}
                      unit="m"
                      onChange={setX0}
                    />
                    <SliderControl
                      label="Initial Velocity"
                      symbol="u"
                      value={velocity1D}
                      min={-20}
                      max={30}
                      unit="m/s"
                      onChange={setVelocity1D}
                      presets={[
                        { label: '0 (Rest)', value: 0 },
                        { label: '10 m/s', value: 10 },
                        { label: '20 m/s', value: 20 },
                      ]}
                    />
                    <SliderControl
                      label="Acceleration"
                      symbol="a"
                      value={accel1D}
                      min={-6}
                      max={6}
                      step={0.5}
                      unit="m/s²"
                      onChange={setAccel1D}
                      presets={[
                        { label: '0 (Uniform)', value: 0 },
                        { label: '+2 m/s²', value: 2 },
                        { label: '-2 m/s²', value: -2 },
                      ]}
                    />

                    <SliderControl
                      label="Graph Time Duration"
                      symbol="T"
                      value={totalDuration}
                      min={4}
                      max={14}
                      step={1}
                      unit="s"
                      onChange={setTotalDuration}
                    />

                    {/* Quick Presets */}
                    <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 block">
                        Allen Notes Pg 44 Presets:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                        <button
                          onClick={() => { setX0(0); setVelocity1D(12); setAccel1D(0); handleReset(); }}
                          className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        >
                          Uniform (a = 0)
                        </button>
                        <button
                          onClick={() => { setX0(0); setVelocity1D(0); setAccel1D(3); handleReset(); }}
                          className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        >
                          Accel from Rest
                        </button>
                        <button
                          onClick={() => { setX0(0); setVelocity1D(16); setAccel1D(-4); handleReset(); }}
                          className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        >
                          Braking to Rest
                        </button>
                        <button
                          onClick={() => { setX0(0); setVelocity1D(12); setAccel1D(-4); handleReset(); }}
                          className="py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                        >
                          Decel & Reverse
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {subMode === 'gravity_vertical' && (
                  <>
                    <SliderControl
                      label="Tower Height"
                      symbol="h₀"
                      value={towerHeight}
                      min={0}
                      max={80}
                      unit="m"
                      onChange={setTowerHeight}
                      presets={[
                        { label: 'Ground (0m)', value: 0 },
                        { label: '30m Tower', value: 30 },
                        { label: '60m Tower', value: 60 },
                      ]}
                    />
                    <SliderControl
                      label="Vertical Launch Speed"
                      symbol="u"
                      value={verticalLaunchSpeed}
                      min={-15}
                      max={35}
                      unit="m/s"
                      onChange={setVerticalLaunchSpeed}
                      presets={[
                        { label: '0 (Dropped)', value: 0 },
                        { label: '15 m/s (Up)', value: 15 },
                        { label: '25 m/s (Up)', value: 25 },
                      ]}
                    />
                    <SliderControl
                      label="Gravity"
                      symbol="g"
                      value={gravity1D}
                      min={1}
                      max={20}
                      step={0.2}
                      unit="m/s²"
                      onChange={setGravity1D}
                      presets={[
                        { label: '9.8', value: 9.8 },
                        { label: '10', value: 10 },
                      ]}
                    />
                  </>
                )}

                {subMode === 'relative_pursuit' && (
                  <>
                    <SliderControl
                      label="Initial Gap"
                      symbol="d₀"
                      value={initialGap}
                      min={10}
                      max={80}
                      unit="m"
                      onChange={setInitialGap}
                    />
                    <SliderControl
                      label="Car A (Pursuer) Speed"
                      symbol="u_A"
                      value={speedA}
                      min={0}
                      max={25}
                      unit="m/s"
                      onChange={setSpeedA}
                    />
                    <SliderControl
                      label="Car A Acceleration"
                      symbol="a_A"
                      value={accelA}
                      min={0}
                      max={6}
                      step={0.5}
                      unit="m/s²"
                      onChange={setAccelA}
                    />
                    <SliderControl
                      label="Car B (Lead) Speed"
                      symbol="u_B"
                      value={speedB}
                      min={0}
                      max={25}
                      unit="m/s"
                      onChange={setSpeedB}
                    />
                    <SliderControl
                      label="Car B Acceleration"
                      symbol="a_B"
                      value={accelB}
                      min={-3}
                      max={4}
                      step={0.5}
                      unit="m/s²"
                      onChange={setAccelB}
                    />
                  </>
                )}
              </div>

              {/* Live Formula HUD */}
              {subMode === 'motion_graphs' && (
                <FormulaHUD
                  title="Equations of Rectilinear Motion"
                  formulaLatex="v = u + at, \quad s = ut + \frac{1}{2}at^2, \quad v^2 = u^2 + 2as"
                  evaluatedValues={{
                    'Position x(t)': `${currentX1D.toFixed(1)} m`,
                    'Velocity v(t)': `${currentV1D.toFixed(1)} m/s`,
                    'Displacement': `${(currentX1D - x0).toFixed(1)} m`,
                    'Stopping Time': stoppingTime !== null ? `${stoppingTime.toFixed(2)}s` : 'N/A',
                    'Stopping Distance': stoppingDistance !== null ? `${stoppingDistance.toFixed(1)}m` : 'N/A',
                  }}
                  explanation="Allen Notes Pg 43: When acceleration is constant, velocity varies linearly with time, and displacement varies quadratically."
                  noteSource="Allen Notes Pg 43"
                />
              )}

              {subMode === 'gravity_vertical' && (
                <FormulaHUD
                  title="Vertical Motion Under Gravity"
                  formulaLatex="H_{\max} = h_0 + \frac{u^2}{2g}, \quad T = \frac{u + \sqrt{u^2 + 2gh_0}}{g}"
                  evaluatedValues={{
                    'Apex Height': `${apexHeight.toFixed(2)} m`,
                    'Time to Apex': `${apexTime.toFixed(2)} s`,
                    'Total Flight Time': `${flightTimeVert.toFixed(2)} s`,
                    'Ground Strike Speed': `${impactSpeed.toFixed(2)} m/s`,
                  }}
                  explanation="Allen Notes Pg 44: Ascent and descent above launch plane are strictly symmetric. At highest point, instantaneous velocity is strictly zero."
                  noteSource="Allen Notes Pg 44"
                />
              )}

              {subMode === 'relative_pursuit' && (
                <FormulaHUD
                  title="1D Relative Pursuit"
                  formulaLatex="x_{\text{rel}} = d_0 + (u_B - u_A)t + \frac{1}{2}(a_B - a_A)t^2"
                  evaluatedValues={{
                    'Relative Speed': `${(speedA + accelA * currentTime - (speedB + accelB * currentTime)).toFixed(1)} m/s`,
                    'Catch Condition': catchTime !== null ? `Catch at t = ${catchTime.toFixed(2)}s` : 'Cannot Catch',
                    'Closest Approach': minApproachDist !== null ? `${Math.max(0, minApproachDist).toFixed(1)} m` : 'N/A',
                  }}
                  explanation="Catching occurs when x_rel = 0. If relative acceleration is unfavorable, the minimum distance occurs when relative velocity vanishes (v_A = v_B)."
                  noteSource="Allen Notes Pg 45"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theory & Derivations */}
      {activeTab === 'theory' && <Kinematics1DTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
