import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { WorkEnergyTheory } from './WorkEnergyTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Layers } from 'lucide-react';

export interface WorkEnergyLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const WorkEnergyLab: React.FC<WorkEnergyLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [subMode, setSubMode] = useState<'potential_well' | 'work_theorem' | 'spring_mass'>('potential_well');

  // Scenario 1: Potential Well U(x)
  const [wellProfile, setWellProfile] = useState<'double_well' | 'harmonic' | 'asymmetric'>('double_well');
  const [initialReleaseX, setInitialReleaseX] = useState<number>(-1.8); // m
  const [particleMass, setParticleMass] = useState<number>(1.0); // kg

  // Scenario 2: Work-Energy Theorem (F - x curve)
  const [appliedForceF0, setAppliedForceF0] = useState<number>(20); // N
  const [forceSlope, setForceSlope] = useState<number>(-2.5); // N/m
  const [frictionMu, setFrictionMu] = useState<number>(0.15);
  const [sliderDisplacement, setSliderDisplacement] = useState<number>(6); // m

  // Scenario 3: Spring-Mass Oscillator
  const [springK, setSpringK] = useState<number>(25); // N/m
  const [initialExtension, setInitialExtension] = useState<number>(2.0); // m
  const [dampingMu, setDampingMu] = useState<number>(0.05);

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [showTrajectoryGrid, setShowTrajectoryGrid] = useState<boolean>(true);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coordSysRef = useRef<CoordinateSystem>(new CoordinateSystem({ pixelsPerMeter: 45, originX: 410, originY: 240 }));
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Dynamic particle states
  const posRef = useRef<number>(initialReleaseX);
  const velRef = useRef<number>(0);
  const totalEnergyRef = useRef<number>(0);

  // Potential Energy Functions & Derivatives
  const getPotentialAndForce = useCallback((x: number) => {
    let U = 0;
    let F = 0; // F = -dU/dx
    let d2U = 0;

    if (wellProfile === 'double_well') {
      // U(x) = x^4 - 2x^2 + 1. Minima at x = ±1 (U=0), Maximum at x = 0 (U=1)
      U = Math.pow(x, 4) - 2 * Math.pow(x, 2) + 1;
      F = -(4 * Math.pow(x, 3) - 4 * x);
      d2U = 12 * Math.pow(x, 2) - 4;
    } else if (wellProfile === 'harmonic') {
      // U(x) = 0.5 * k * x^2
      const k = 2;
      U = 0.5 * k * Math.pow(x, 2);
      F = -k * x;
      d2U = k;
    } else {
      // Asymmetric: U(x) = 0.3*x^3 - 1.2*x + 1.5
      U = 0.25 * Math.pow(x, 3) - 1.2 * x + 2.0;
      F = -(0.75 * Math.pow(x, 2) - 1.2);
      d2U = 1.5 * x;
    }
    return { U, F, d2U };
  }, [wellProfile]);

  // Analytical: Work-Energy Theorem
  const boxMass = 4; // kg
  const normalReaction = boxMass * 9.8;
  const frictionForce = frictionMu * normalReaction;
  // W_net = integral (F0 + slope*x - frictionForce) dx from 0 to sliderDisplacement
  const workApplied = appliedForceF0 * sliderDisplacement + 0.5 * forceSlope * Math.pow(sliderDisplacement, 2);
  const workFriction = -frictionForce * sliderDisplacement;
  const netWork = workApplied + workFriction;
  const finalKineticEnergy = Math.max(0, netWork);
  const finalSpeed = Math.sqrt((2 * finalKineticEnergy) / boxMass);

  // Analytical: Spring-Mass
  const omega0 = Math.sqrt(springK / particleMass);
  const initialSpringEnergy = 0.5 * springK * Math.pow(initialExtension, 2);

  // Auto-fit function
  const autoFitViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const coordSys = coordSysRef.current;
    const width = canvas.width;
    const height = canvas.height;

    if (subMode === 'potential_well') {
      coordSys.pixelsPerMeter = 60;
      coordSys.originX = width / 2;
      coordSys.originY = height - 70;
    } else if (subMode === 'work_theorem') {
      coordSys.pixelsPerMeter = 40;
      coordSys.originX = 80;
      coordSys.originY = height - 90;
    } else {
      // Spring Mass
      coordSys.pixelsPerMeter = 55;
      coordSys.originX = width / 2;
      coordSys.originY = height / 2 + 10;
    }
  }, [subMode]);

  const handleReset = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.reset();
      loopRef.current.pause();
    }
    setIsRunning(false);
    setCurrentTime(0);

    if (subMode === 'potential_well') {
      posRef.current = initialReleaseX;
      velRef.current = 0;
      const { U } = getPotentialAndForce(initialReleaseX);
      totalEnergyRef.current = U;
    } else if (subMode === 'work_theorem') {
      posRef.current = 0;
      velRef.current = 0;
    } else {
      posRef.current = initialExtension;
      velRef.current = 0;
      totalEnergyRef.current = 0.5 * springK * initialExtension * initialExtension;
    }

    autoFitViewport();
    renderScene();
  }, [subMode, initialReleaseX, initialExtension, springK, getPotentialAndForce, autoFitViewport]);

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

    if (showTrajectoryGrid) {
      coordSys.drawGrid(ctx, width, height, {
        gridColor: 'rgba(255, 255, 255, 0.03)',
        axisColor: 'rgba(161, 161, 170, 0.2)',
        labelColor: '#71717a',
      });
    }

    // SCENARIO 1: Potential Energy Landscape U(x)
    if (subMode === 'potential_well') {
      const originX = coordSys.originX;
      const originY = coordSys.originY;
      const scale = coordSys.pixelsPerMeter;

      // Draw U(x) potential curve
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      const xMin = -3.2;
      const xMax = 3.2;
      const steps = 140;

      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin);
        const { U } = getPotentialAndForce(x);
        const sx = originX + x * scale;
        const sy = originY - U * scale;

        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Potential Well Soft Shading Under Curve
      ctx.lineTo(originX + xMax * scale, originY);
      ctx.lineTo(originX + xMin * scale, originY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fill();
      ctx.restore();

      // Total Mechanical Energy Line E
      const E = totalEnergyRef.current;
      const eScreenY = originY - E * scale;
      ctx.save();
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(originX - 180, eScreenY);
      ctx.lineTo(originX + 180, eScreenY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fafafa';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`Total Energy E = ${E.toFixed(2)} J`, originX + 188, eScreenY + 3);
      ctx.restore();

      // Critical Equilibrium Points Annotation
      if (wellProfile === 'double_well') {
        // Minima at x = -1, +1; Maximum at x = 0
        const points = [
          { x: -1, type: 'Stable', color: '#22c55e' },
          { x: 0, type: 'Unstable', color: '#ef4444' },
          { x: 1, type: 'Stable', color: '#22c55e' },
        ];
        points.forEach((p) => {
          const { U } = getPotentialAndForce(p.x);
          const px = originX + p.x * scale;
          const py = originY - U * scale;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(p.type, px, py + 14);
        });
      }

      // Particle on the potential landscape
      const currentX = posRef.current;
      const { U: curU, F: curF, d2U: curD2U } = getPotentialAndForce(currentX);
      const curK = Math.max(0, E - curU);
      const partSx = originX + currentX * scale;
      const partSy = originY - curU * scale;

      // Particle body
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(partSx, partSy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Restoring/Repelling Force Vector F = -dU/dx (Amber)
      if (Math.abs(curF) > 0.05) {
        VectorRenderer.drawScreenVector(
          ctx,
          new Vector2D(partSx, partSy),
          new Vector2D(curF * 25, 0),
          { color: '#f59e0b', lineWidth: 2, label: `F = ${curF.toFixed(1)} N`, headSize: 6 }
        );
      }

      // Telemetry badge
      ctx.fillStyle = '#fafafa';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`K = ${curK.toFixed(2)} J | U = ${curU.toFixed(2)} J | d²U/dx² = ${curD2U.toFixed(1)}`, 20, 30);
    }

    // SCENARIO 2: Work-Energy Theorem (F - x Curve & Slider)
    if (subMode === 'work_theorem') {
      const roadY = coordSys.originY;

      // Ground surface
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, roadY, width, 40);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, roadY);
      ctx.lineTo(width, roadY);
      ctx.stroke();

      // Box at position x
      const curX = posRef.current;
      const boxSx = coordSys.originX + curX * coordSys.pixelsPerMeter;

      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxSx - 20, roadY - 32, 40, 32);
      ctx.fillRect(boxSx - 20, roadY - 32, 40, 32);

      ctx.fillStyle = '#09090b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('4 kg', boxSx, roadY - 14);

      // Applied force arrow
      const curF = appliedForceF0 + forceSlope * curX;
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(boxSx + 20, roadY - 16),
        new Vector2D(curF * 2.5, 0),
        { color: '#22c55e', lineWidth: 2, label: `F(x) = ${curF.toFixed(1)} N`, headSize: 6 }
      );

      // Friction force arrow
      VectorRenderer.drawScreenVector(
        ctx,
        new Vector2D(boxSx - 20, roadY - 16),
        new Vector2D(-frictionForce * 3.5, 0),
        { color: '#ef4444', lineWidth: 1.8, label: `f_k = ${frictionForce.toFixed(1)} N`, headSize: 6 }
      );

      // Start & Finish line markers
      ctx.strokeStyle = 'rgba(250, 250, 250, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(coordSys.originX, roadY - 100);
      ctx.lineTo(coordSys.originX, roadY);
      const finishSx = coordSys.originX + sliderDisplacement * coordSys.pixelsPerMeter;
      ctx.moveTo(finishSx, roadY - 100);
      ctx.lineTo(finishSx, roadY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#71717a';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('Start x=0', coordSys.originX, roadY + 20);
      ctx.fillText(`Target d=${sliderDisplacement}m`, finishSx, roadY + 20);
    }

    // SCENARIO 3: Spring-Mass Oscillator
    if (subMode === 'spring_mass') {
      const centerX = coordSys.originX;
      const centerY = coordSys.originY;
      const scale = coordSys.pixelsPerMeter;

      // Wall at left
      const wallX = centerX - 180;
      ctx.fillStyle = '#27272a';
      ctx.fillRect(wallX - 16, centerY - 60, 16, 120);
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wallX - 16, centerY - 60, 16, 120);

      // Horizontal ground line
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wallX, centerY + 20);
      ctx.lineTo(width - 40, centerY + 20);
      ctx.stroke();

      // Current mass position
      const curX = posRef.current;
      const massSx = centerX + curX * scale;

      // Spring coil from wallX to massSx
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const coils = 14;
      const springLength = massSx - 20 - wallX;
      ctx.moveTo(wallX, centerY);
      for (let c = 0; c <= coils; c++) {
        const cx = wallX + (c / coils) * springLength;
        const cy = c % 2 === 0 ? centerY - 12 : centerY + 12;
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(massSx - 20, centerY);
      ctx.stroke();

      // Mass block
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#fafafa';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(massSx - 20, centerY - 20, 40, 40);
      ctx.fillRect(massSx - 20, centerY - 20, 40, 40);

      ctx.fillStyle = '#09090b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${particleMass}kg`, massSx, centerY + 4);

      // Natural length marker x = 0
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 45);
      ctx.lineTo(centerX, centerY + 45);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText('x = 0 (Relaxed)', centerX, centerY - 52);

      // Energy Bar Stack on right
      const curK = 0.5 * particleMass * Math.pow(velRef.current, 2);
      const curU = 0.5 * springK * Math.pow(curX, 2);
      const totalE = curK + curU;

      const barX = width - 130;
      const barY = 50;
      const barW = 100;
      const maxE = Math.max(1, initialSpringEnergy);
      const kW = (curK / maxE) * barW;
      const uW = (curU / maxE) * barW;

      ctx.fillStyle = '#18181b';
      ctx.fillRect(barX, barY, barW, 16);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(barX, barY, barW, 16);

      // Kinetic Energy (Green)
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(barX, barY, kW, 16);
      // Potential Energy (Sky blue)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX + kW, barY, uW, 16);

      ctx.fillStyle = '#fafafa';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`K: ${curK.toFixed(1)}J | U: ${curU.toFixed(1)}J`, barX, barY - 6);
      ctx.fillText(`Total E = ${totalE.toFixed(1)}J`, barX, barY + 28);
    }
  }, [subMode, showTrajectoryGrid, wellProfile, getPotentialAndForce, appliedForceF0, forceSlope, frictionForce, sliderDisplacement, springK, particleMass, initialSpringEnergy]);

  // Viewport and auto-render
  useEffect(() => {
    autoFitViewport();
    renderScene();
  }, [subMode, wellProfile, initialReleaseX, appliedForceF0, forceSlope, frictionMu, sliderDisplacement, springK, initialExtension, autoFitViewport, renderScene]);

  // Setup Physics Loop
  useEffect(() => {
    handleReset();

    const loop = new PhysicsLoop({
      update: (dt) => {
        setCurrentTime((prev) => prev + dt);

        if (subMode === 'potential_well') {
          // Numerical integration of particle in arbitrary potential well
          const x = posRef.current;
          const v = velRef.current;
          const { F } = getPotentialAndForce(x);
          const a = F / particleMass;

          const newV = v + a * dt;
          const newX = x + newV * dt;

          posRef.current = newX;
          velRef.current = newV;
        } else if (subMode === 'work_theorem') {
          const x = posRef.current;
          if (x < sliderDisplacement) {
            const curF = appliedForceF0 + forceSlope * x;
            const netF = Math.max(0, curF - frictionForce);
            const a = netF / boxMass;

            const newV = velRef.current + a * dt;
            const newX = Math.min(sliderDisplacement, x + newV * dt);
            posRef.current = newX;
            velRef.current = newV;
          } else {
            loop.pause();
            setIsRunning(false);
          }
        } else if (subMode === 'spring_mass') {
          // Spring harmonic oscillator with damping
          const x = posRef.current;
          const v = velRef.current;
          const fSpring = -springK * x;
          const fDamp = -dampingMu * v * 10;
          const a = (fSpring + fDamp) / particleMass;

          const newV = v + a * dt;
          const newX = x + newV * dt;
          posRef.current = newX;
          velRef.current = newV;
        }
      },
      render: renderScene,
    });

    loopRef.current = loop;

    return () => {
      loop.destroy();
    };
  }, [subMode, particleMass, getPotentialAndForce, sliderDisplacement, appliedForceF0, forceSlope, frictionForce, springK, dampingMu, handleReset, renderScene]);

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

  const handleZoom = (factor: number) => {
    coordSysRef.current.zoom(factor);
    renderScene();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-zinc-100">
              Work, Energy & Power
            </h2>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
              Allen Ch 06
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Potential energy landscapes, work-energy integration, stable/unstable equilibria & spring conservation.
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
                onClick={() => { setSubMode('potential_well'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'potential_well' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Potential Energy Landscape U(x)
              </button>
              <button
                onClick={() => { setSubMode('work_theorem'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'work_theorem' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Work-Energy Theorem (F-x Area)
              </button>
              <button
                onClick={() => { setSubMode('spring_mass'); handleReset(); }}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  subMode === 'spring_mass' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Spring-Mass Energy Breakdown
              </button>
            </div>

            {/* Viewport controls */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <button
                onClick={autoFitViewport}
                title="Fit viewport"
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
            {/* Left 8 cols: Canvas Viewport */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-[#09090b]">
                <canvas
                  ref={canvasRef}
                  width={820}
                  height={400}
                  className="w-full h-[360px] block"
                />

                {/* Telemetry pill */}
                <div className="absolute top-3 left-3 flex gap-2 font-mono text-[11px] text-zinc-300">
                  {subMode === 'potential_well' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                        x: {posRef.current.toFixed(2)}m
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-amber-400">
                        v: {velRef.current.toFixed(2)} m/s
                      </span>
                    </>
                  )}
                  {subMode === 'work_theorem' && (
                    <>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-sky-400">
                        x: {posRef.current.toFixed(2)} / {sliderDisplacement}m
                      </span>
                      <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                        v: {velRef.current.toFixed(2)} m/s
                      </span>
                    </>
                  )}
                  {subMode === 'spring_mass' && (
                    <span className="bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 text-emerald-400">
                      Displacement x: {posRef.current.toFixed(2)} m
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
            </div>

            {/* Right 4 cols: Parameter Controls & Formula HUD */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-3">
                <span className="text-xs font-medium text-zinc-300 block">
                  Parameters
                </span>

                {subMode === 'potential_well' && (
                  <>
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 block">Potential Function:</span>
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                        <button
                          onClick={() => { setWellProfile('double_well'); handleReset(); }}
                          className={`py-1 rounded border transition-colors ${
                            wellProfile === 'double_well' ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-zinc-900/80 text-zinc-400 border-zinc-850'
                          }`}
                        >
                          Double Well
                        </button>
                        <button
                          onClick={() => { setWellProfile('harmonic'); handleReset(); }}
                          className={`py-1 rounded border transition-colors ${
                            wellProfile === 'harmonic' ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-zinc-900/80 text-zinc-400 border-zinc-850'
                          }`}
                        >
                          Harmonic
                        </button>
                        <button
                          onClick={() => { setWellProfile('asymmetric'); handleReset(); }}
                          className={`py-1 rounded border transition-colors ${
                            wellProfile === 'asymmetric' ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : 'bg-zinc-900/80 text-zinc-400 border-zinc-850'
                          }`}
                        >
                          Asymmetric
                        </button>
                      </div>
                    </div>

                    <SliderControl
                      label="Release Position"
                      symbol="x_release"
                      value={initialReleaseX}
                      min={-2.2}
                      max={2.2}
                      step={0.1}
                      unit="m"
                      onChange={setInitialReleaseX}
                      presets={[
                        { label: '-1.8m (High E)', value: -1.8 },
                        { label: '-1.0m (Min U)', value: -1.0 },
                        { label: '0.0m (Unstable)', value: 0 },
                      ]}
                    />

                    <SliderControl
                      label="Particle Mass"
                      symbol="m"
                      value={particleMass}
                      min={0.5}
                      max={5}
                      step={0.5}
                      unit="kg"
                      onChange={setParticleMass}
                    />
                  </>
                )}

                {subMode === 'work_theorem' && (
                  <>
                    <SliderControl
                      label="Applied Initial Force"
                      symbol="F₀"
                      value={appliedForceF0}
                      min={10}
                      max={50}
                      unit="N"
                      onChange={setAppliedForceF0}
                    />
                    <SliderControl
                      label="Force Slope"
                      symbol="dF/dx"
                      value={forceSlope}
                      min={-5}
                      max={2}
                      step={0.5}
                      unit="N/m"
                      onChange={setForceSlope}
                    />
                    <SliderControl
                      label="Friction Coeff."
                      symbol="μ_k"
                      value={frictionMu}
                      min={0}
                      max={0.5}
                      step={0.05}
                      unit=""
                      onChange={setFrictionMu}
                    />
                    <SliderControl
                      label="Travel Distance"
                      symbol="d"
                      value={sliderDisplacement}
                      min={2}
                      max={12}
                      unit="m"
                      onChange={setSliderDisplacement}
                    />
                  </>
                )}

                {subMode === 'spring_mass' && (
                  <>
                    <SliderControl
                      label="Spring Constant"
                      symbol="k"
                      value={springK}
                      min={10}
                      max={60}
                      unit="N/m"
                      onChange={setSpringK}
                      presets={[
                        { label: '20 N/m', value: 20 },
                        { label: '40 N/m', value: 40 },
                      ]}
                    />
                    <SliderControl
                      label="Initial Extension"
                      symbol="x₀"
                      value={initialExtension}
                      min={-3}
                      max={3}
                      step={0.2}
                      unit="m"
                      onChange={setInitialExtension}
                      presets={[
                        { label: '+2 m', value: 2 },
                        { label: '-2 m', value: -2 },
                      ]}
                    />
                    <SliderControl
                      label="Frictional Damping"
                      symbol="b"
                      value={dampingMu}
                      min={0}
                      max={0.2}
                      step={0.02}
                      unit=""
                      onChange={setDampingMu}
                    />
                  </>
                )}
              </div>

              {/* Live Formula HUD */}
              {subMode === 'potential_well' && (
                <FormulaHUD
                  title="Potential Energy & Equilibrium"
                  formulaLatex="F = -\frac{dU}{dx}, \quad \text{Stable: } \frac{d^2U}{dx^2} > 0, \quad \text{Unstable: } \frac{d^2U}{dx^2} < 0"
                  evaluatedValues={{
                    'Total Energy E': `${totalEnergyRef.current.toFixed(2)} J`,
                    'Kinetic Energy K': `${Math.max(0, totalEnergyRef.current - getPotentialAndForce(posRef.current).U).toFixed(2)} J`,
                    'Potential Energy U': `${getPotentialAndForce(posRef.current).U.toFixed(2)} J`,
                    'Restoring Force': `${getPotentialAndForce(posRef.current).F.toFixed(2)} N`,
                  }}
                  explanation="Allen Notes Pg 74-76: (1) Force is the negative gradient of potential energy. (2) Stable equilibrium occurs at local potential minima."
                  noteSource="Allen Notes Pg 74-76"
                />
              )}

              {subMode === 'work_theorem' && (
                <FormulaHUD
                  title="Work-Kinetic Energy Theorem"
                  formulaLatex="W_{\text{net}} = \int (F - f_k)\,dx = \Delta K = \frac{1}{2}mv_f^2 - \frac{1}{2}mv_i^2"
                  evaluatedValues={{
                    'Work by Applied Force': `${workApplied.toFixed(1)} J`,
                    'Work by Friction': `${workFriction.toFixed(1)} J`,
                    'Net Work Done': `${netWork.toFixed(1)} J`,
                    'Final Speed v_f': `${finalSpeed.toFixed(2)} m/s`,
                  }}
                  explanation="Allen Notes Pg 62-63: Total work done by all external forces equals the exact gain in kinetic energy."
                  noteSource="Allen Notes Pg 62-63"
                />
              )}

              {subMode === 'spring_mass' && (
                <FormulaHUD
                  title="Spring Mechanical Energy"
                  formulaLatex="E = \frac{1}{2}mv^2 + \frac{1}{2}kx^2 = \text{constant}"
                  evaluatedValues={{
                    'Initial Stored Energy': `${initialSpringEnergy.toFixed(1)} J`,
                    'Natural Frequency ω₀': `${omega0.toFixed(2)} rad/s`,
                    'Max Speed v_max': `${(initialExtension * omega0).toFixed(2)} m/s`,
                  }}
                  explanation="Allen Notes Pg 71: Continuous reversible transformation between kinetic and elastic potential energy."
                  noteSource="Allen Notes Pg 71"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theory & Derivations */}
      {activeTab === 'theory' && <WorkEnergyTheory onNavigateChapter={onNavigateChapter} />}
    </div>
  );
};
