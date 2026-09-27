import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { ShmTheory } from './ShmTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Orbit, Flame } from 'lucide-react';

export interface ShmLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const ShmLab: React.FC<ShmLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [subMode, setSubMode] = useState<'phasor_circle' | 'oscillators_energy' | 'lissajous'>('phasor_circle');

  // SubMode 1: Phasor Circle & Graphs
  const [amplitudeA, setAmplitudeA] = useState<number>(3.0); // m
  const [angularFreqOmega, setAngularFreqOmega] = useState<number>(2.0); // rad/s
  const [initialPhasePhi, setInitialPhasePhi] = useState<number>(0); // rad (0 to 2pi)

  // SubMode 2: Spring-Mass & Pendulum Oscillators
  const [oscMass, setOscMass] = useState<number>(2.0); // kg
  const [springK, setSpringK] = useState<number>(18); // N/m
  const [pendulumL, setPendulumL] = useState<number>(2.5); // m
  const [dampingB, setDampingB] = useState<number>(0.0); // Ns/m

  // SubMode 3: Lissajous Figures
  const [ampX, setAmpX] = useState<number>(3.0); // m
  const [ampY, setAmpY] = useState<number>(3.0); // m
  const [omegaX, setOmegaX] = useState<number>(2.0); // rad/s
  const [omegaY, setOmegaY] = useState<number>(2.0); // rad/s
  const [phaseDeltaDeg, setPhaseDeltaDeg] = useState<number>(90); // degrees

  // Simulation loop dynamic state
  const [simTime, setSimTime] = useState<number>(0);
  const [trail, setTrail] = useState<Vector2D[]>([]);

  // Playback & Viewport Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Reset function
  const handleReset = useCallback(() => {
    setSimTime(0);
    setTrail([]);
  }, []);

  // Update physics in loop
  const updatePhysics = useCallback((dt: number) => {
    const scaledDt = dt * playbackSpeed;
    setSimTime(t => {
      const nextTime = t + scaledDt;

      if (subMode === 'lissajous') {
        const deltaRad = (phaseDeltaDeg * Math.PI) / 180;
        const currentX = ampX * Math.sin(omegaX * nextTime);
        const currentY = ampY * Math.sin(omegaY * nextTime + deltaRad);
        setTrail(prev => {
          const newTrail = [...prev, new Vector2D(currentX, currentY)];
          return newTrail.length > 250 ? newTrail.slice(newTrail.length - 250) : newTrail;
        });
      }

      return nextTime;
    });
  }, [playbackSpeed, subMode, phaseDeltaDeg, ampX, ampY, omegaX, omegaY]);

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

  // Derived current state for Phasor
  const currentPhase = angularFreqOmega * simTime + initialPhasePhi;
  const currentX = amplitudeA * Math.cos(currentPhase);
  const currentV = -amplitudeA * angularFreqOmega * Math.sin(currentPhase);
  const currentA = -angularFreqOmega * angularFreqOmega * currentX;

  // Derived for Oscillator
  const oscOmega = Math.sqrt(springK / oscMass);
  const oscDecay = dampingB > 0 ? Math.exp((-dampingB * simTime) / (2 * oscMass)) : 1.0;
  const oscX = amplitudeA * oscDecay * Math.cos(oscOmega * simTime);
  const oscV = -amplitudeA * oscDecay * oscOmega * Math.sin(oscOmega * simTime);
  const currentPE = 0.5 * springK * oscX * oscX;
  const currentKE = 0.5 * oscMass * oscV * oscV;
  const totalEnergy = currentPE + currentKE;

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const coord = new CoordinateSystem({
      pixelsPerMeter: 38 * zoomLevel,
      originX: width / 2,
      originY: height / 2,
    });
    coord.drawGrid(ctx, width, height);

    if (subMode === 'phasor_circle') {
      const centerScreen = coord.worldToScreen(new Vector2D(-3.5, 0));
      const radiusScreen = amplitudeA * coord.pixelsPerMeter;

      ctx.save();
      // 1. Reference Circle
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Horizontal diameter & vertical diameter
      ctx.beginPath();
      ctx.moveTo(centerScreen.x - radiusScreen, centerScreen.y);
      ctx.lineTo(centerScreen.x + radiusScreen, centerScreen.y);
      ctx.moveTo(centerScreen.x, centerScreen.y - radiusScreen);
      ctx.lineTo(centerScreen.x, centerScreen.y + radiusScreen);
      ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
      ctx.stroke();

      // Revolving phasor point Q on circle
      const qX = centerScreen.x + radiusScreen * Math.cos(currentPhase);
      const qY = centerScreen.y - radiusScreen * Math.sin(currentPhase);

      ctx.beginPath();
      ctx.arc(qX, qY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Phasor arm from center to Q
      ctx.beginPath();
      ctx.moveTo(centerScreen.x, centerScreen.y);
      ctx.lineTo(qX, qY);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Projection line down to horizontal diameter
      const projX = qX;
      const projY = centerScreen.y;
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(qX, qY);
      ctx.lineTo(projX, projY);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      ctx.stroke();
      ctx.setLineDash([]);

      // Projected oscillating bead on diameter (Linear SHM)
      ctx.beginPath();
      ctx.arc(projX, projY, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Velocity & Acceleration vectors on oscillating bead
      const vVectorScreen = new Vector2D(currentV * coord.pixelsPerMeter * 0.2, 0);
      const aVectorScreen = new Vector2D(currentA * coord.pixelsPerMeter * 0.1, 0);

      VectorRenderer.drawScreenVector(ctx, new Vector2D(projX, projY), vVectorScreen, { color: '#22c55e', lineWidth: 2.5, label: 'v' });
      VectorRenderer.drawScreenVector(ctx, new Vector2D(projX, projY + 16), aVectorScreen, { color: '#f59e0b', lineWidth: 2, label: 'a' });

      // Right Side: Phase Space Ellipse (v vs x)
      const phaseCenter = coord.worldToScreen(new Vector2D(4.0, 0));
      const phaseRadiusX = amplitudeA * coord.pixelsPerMeter * 0.8;
      const phaseRadiusY = (amplitudeA * angularFreqOmega) * coord.pixelsPerMeter * 0.4;

      ctx.beginPath();
      ctx.ellipse(phaseCenter.x, phaseCenter.y, phaseRadiusX, phaseRadiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Phase Space Point
      const phasePointX = phaseCenter.x + (currentX / amplitudeA) * phaseRadiusX;
      const phasePointY = phaseCenter.y - (currentV / (amplitudeA * angularFreqOmega)) * phaseRadiusY;

      ctx.beginPath();
      ctx.arc(phasePointX, phasePointY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.fillStyle = '#eab308';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText('Phase Space (v vs x)', phaseCenter.x - 50, phaseCenter.y - phaseRadiusY - 14);

      ctx.restore();
    } else if (subMode === 'oscillators_energy') {
      ctx.save();
      // 1. Horizontal Spring-Mass on Left
      const springFloorY = 2.0;
      const wallScreen = coord.worldToScreen(new Vector2D(-7.5, springFloorY));
      const blockPos = new Vector2D(-4.0 + oscX, springFloorY);
      const blockScreen = coord.worldToScreen(blockPos);

      // Support Wall
      ctx.beginPath();
      ctx.moveTo(wallScreen.x, wallScreen.y - 30);
      ctx.lineTo(wallScreen.x, wallScreen.y + 30);
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Spring Coils
      ctx.beginPath();
      ctx.moveTo(wallScreen.x, wallScreen.y);
      const numCoils = 14;
      const springSpan = blockScreen.x - wallScreen.x - 25;
      for (let i = 1; i <= numCoils; i++) {
        const cx = wallScreen.x + (i / numCoils) * springSpan;
        const cy = wallScreen.y + (i % 2 === 0 ? 12 : -12);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(blockScreen.x - 25, blockScreen.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mass Block
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.fillRect(blockScreen.x - 25, blockScreen.y - 25, 50, 50);
      ctx.strokeRect(blockScreen.x - 25, blockScreen.y - 25, 50, 50);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${oscMass}kg`, blockScreen.x, blockScreen.y + 4);

      // 2. Simple Pendulum on Right
      const pivotScreen = coord.worldToScreen(new Vector2D(4.0, 3.5));
      const pendTheta = (oscX / pendulumL) * 0.7; // angular displacement
      const bobScreenX = pivotScreen.x + pendulumL * coord.pixelsPerMeter * Math.sin(pendTheta);
      const bobScreenY = pivotScreen.y + pendulumL * coord.pixelsPerMeter * Math.cos(pendTheta);

      ctx.beginPath();
      ctx.moveTo(pivotScreen.x, pivotScreen.y);
      ctx.lineTo(bobScreenX, bobScreenY);
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bobScreenX, bobScreenY, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Potential & Kinetic Energy Parabolas at Bottom
      const energyCenter = coord.worldToScreen(new Vector2D(0, -2.5));
      const graphW = 160;
      const graphH = 75;

      // Axes
      ctx.beginPath();
      ctx.moveTo(energyCenter.x - graphW, energyCenter.y);
      ctx.lineTo(energyCenter.x + graphW, energyCenter.y);
      ctx.moveTo(energyCenter.x, energyCenter.y - graphH - 10);
      ctx.lineTo(energyCenter.x, energyCenter.y + 10);
      ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Parabola U(x) = 1/2 k x^2
      ctx.beginPath();
      for (let px = -graphW; px <= graphW; px += 2) {
        const xNorm = px / graphW; // -1 to 1
        const uVal = xNorm * xNorm * graphH;
        if (px === -graphW) ctx.moveTo(energyCenter.x + px, energyCenter.y - uVal);
        else ctx.lineTo(energyCenter.x + px, energyCenter.y - uVal);
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inverted Parabola K(x) = 1/2 k (A^2 - x^2)
      ctx.beginPath();
      for (let px = -graphW; px <= graphW; px += 2) {
        const xNorm = px / graphW;
        const kVal = (1 - xNorm * xNorm) * graphH;
        if (px === -graphW) ctx.moveTo(energyCenter.x + px, energyCenter.y - kVal);
        else ctx.lineTo(energyCenter.x + px, energyCenter.y - kVal);
      }
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Total Energy Horizontal Line
      ctx.beginPath();
      ctx.moveTo(energyCenter.x - graphW, energyCenter.y - graphH);
      ctx.lineTo(energyCenter.x + graphW, energyCenter.y - graphH);
      ctx.strokeStyle = '#ec4899';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bead indicating current state on energy parabola
      const curXNorm = Math.max(-1, Math.min(1, oscX / amplitudeA));
      const curBeadX = energyCenter.x + curXNorm * graphW;
      const curBeadU_Y = energyCenter.y - curXNorm * curXNorm * graphH;
      const curBeadK_Y = energyCenter.y - (1 - curXNorm * curXNorm) * graphH;

      ctx.beginPath();
      ctx.arc(curBeadX, curBeadU_Y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(curBeadX, curBeadK_Y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      ctx.fillStyle = '#ec4899';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText('E = U + K = Constant', energyCenter.x - 55, energyCenter.y - graphH - 6);

      ctx.restore();
    } else if (subMode === 'lissajous') {
      ctx.save();
      // Draw Lissajous Path Trail
      if (trail.length > 1) {
        ctx.beginPath();
        trail.forEach((pt, idx) => {
          const s = coord.worldToScreen(pt);
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      // Current Particle
      if (trail.length > 0) {
        const lastPt = coord.worldToScreen(trail[trail.length - 1]);
        ctx.beginPath();
        ctx.arc(lastPt.x, lastPt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [subMode, amplitudeA, angularFreqOmega, currentPhase, currentX, currentV, currentA, oscMass, springK, pendulumL, dampingB, oscX, oscV, currentPE, currentKE, totalEnergy, trail, zoomLevel]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              CH 09
            </span>
            <h1 className="text-sm font-medium text-zinc-100">
              Simple Harmonic Motion & Phasor Studio
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
              onClick={() => {
                setSubMode('phasor_circle');
                handleReset();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'phasor_circle'
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Phasor Circle & Phase Space
            </button>
            <button
              onClick={() => {
                setSubMode('oscillators_energy');
                handleReset();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'oscillators_energy'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Oscillators & Energy Parabolas
            </button>
            <button
              onClick={() => {
                setSubMode('lissajous');
                handleReset();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'lissajous'
                  ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Lissajous Superposition
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {activeTab === 'theory' ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <ShmTheory onNavigateChapter={onNavigateChapter} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas Viewport */}
          <div className="flex-1 relative flex flex-col bg-[#09090b] border-r border-zinc-800/80">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 backdrop-blur text-[11px] font-mono text-zinc-300">
                {subMode === 'phasor_circle' && `x = ${currentX.toFixed(2)}m | v = ${currentV.toFixed(2)}m/s | a = ${currentA.toFixed(2)}m/s²`}
                {subMode === 'oscillators_energy' && `U = ${currentPE.toFixed(1)}J | K = ${currentKE.toFixed(1)}J | E_tot = ${totalEnergy.toFixed(1)}J`}
                {subMode === 'lissajous' && `Ratio ωx:ωy = ${omegaX}:${omegaY} | Phase δ = ${phaseDeltaDeg}°`}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 w-full h-full cursor-crosshair">
              <canvas ref={canvasRef} className="w-full h-full block" />
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
                onReset={handleReset}
                onStep={() => updatePhysics(0.016)}
                timeScale={playbackSpeed}
                onTimeScaleChange={setPlaybackSpeed}
                currentTime={simTime}
              />
            </div>
          </div>

          {/* Right Sidebar Controls & HUD */}
          <div className="w-full lg:w-96 p-5 bg-zinc-950/60 overflow-y-auto space-y-5 border-l border-zinc-800/60">
            {subMode === 'phasor_circle' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-sky-400" />
                  Phasor Circle Parameters
                </span>
                <SliderControl
                  label="Amplitude (A)"
                  value={amplitudeA}
                  min={1.0}
                  max={5.0}
                  step={0.25}
                  unit="m"
                  onChange={setAmplitudeA}
                />
                <SliderControl
                  label="Angular Frequency (ω)"
                  value={angularFreqOmega}
                  min={0.5}
                  max={6.0}
                  step={0.25}
                  unit="rad/s"
                  onChange={setAngularFreqOmega}
                />
                <SliderControl
                  label="Initial Phase (ϕ)"
                  value={initialPhasePhi}
                  min={0}
                  max={Math.PI * 2}
                  step={0.1}
                  unit="rad"
                  onChange={setInitialPhasePhi}
                />
              </div>
            )}

            {subMode === 'oscillators_energy' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-400" />
                  Oscillator Parameters
                </span>
                <SliderControl
                  label="Oscillator Mass (m)"
                  value={oscMass}
                  min={0.5}
                  max={6.0}
                  step={0.5}
                  unit="kg"
                  onChange={setOscMass}
                />
                <SliderControl
                  label="Spring Constant (k)"
                  value={springK}
                  min={5}
                  max={50}
                  step={2}
                  unit="N/m"
                  onChange={setSpringK}
                />
                <SliderControl
                  label="Pendulum Length (L)"
                  value={pendulumL}
                  min={1.0}
                  max={5.0}
                  step={0.25}
                  unit="m"
                  onChange={setPendulumL}
                />
                <SliderControl
                  label="Viscous Damping (b)"
                  value={dampingB}
                  min={0}
                  max={1.5}
                  step={0.05}
                  unit="Ns/m"
                  onChange={setDampingB}
                />
              </div>
            )}

            {subMode === 'lissajous' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300">Lissajous Superposition</span>
                <SliderControl
                  label="Horizontal Frequency (ωx)"
                  value={omegaX}
                  min={1.0}
                  max={6.0}
                  step={0.5}
                  unit="rad/s"
                  onChange={(v) => {
                    setOmegaX(v);
                    handleReset();
                  }}
                />
                <SliderControl
                  label="Vertical Frequency (ωy)"
                  value={omegaY}
                  min={1.0}
                  max={6.0}
                  step={0.5}
                  unit="rad/s"
                  onChange={(v) => {
                    setOmegaY(v);
                    handleReset();
                  }}
                />
                <SliderControl
                  label="Phase Difference (δ)"
                  value={phaseDeltaDeg}
                  min={0}
                  max={360}
                  step={15}
                  unit="°"
                  onChange={(v) => {
                    setPhaseDeltaDeg(v);
                    handleReset();
                  }}
                />
                <SliderControl
                  label="Amplitude X"
                  value={ampX}
                  min={1.5}
                  max={4.5}
                  step={0.5}
                  unit="m"
                  onChange={(v) => {
                    setAmpX(v);
                    handleReset();
                  }}
                />
                <SliderControl
                  label="Amplitude Y"
                  value={ampY}
                  min={1.5}
                  max={4.5}
                  step={0.5}
                  unit="m"
                  onChange={(v) => {
                    setAmpY(v);
                    handleReset();
                  }}
                />
              </div>
            )}

            {/* Live Formula HUD */}
            <div className="pt-2">
              {subMode === 'phasor_circle' && (
                <FormulaHUD
                  title="Reference Circle Phasor Projection"
                  formulaLatex="x = A\cos(\omega t + \phi), \quad v = -A\omega\sin(\omega t + \phi)"
                  evaluatedValues={{
                    Time_Period: `${((2 * Math.PI) / angularFreqOmega).toFixed(2)} s`,
                    Frequency: `${(angularFreqOmega / (2 * Math.PI)).toFixed(2)} Hz`,
                    V_max: `${(amplitudeA * angularFreqOmega).toFixed(2)} m/s`,
                    A_max: `${(amplitudeA * angularFreqOmega * angularFreqOmega).toFixed(2)} m/s²`,
                  }}
                />
              )}

              {subMode === 'oscillators_energy' && (
                <FormulaHUD
                  title="Oscillator Mechanical Energy Conservation"
                  formulaLatex="E = \frac{1}{2}kx^2 + \frac{1}{2}mv^2 = \frac{1}{2}kA^2"
                  evaluatedValues={{
                    Spring_Omega: `${oscOmega.toFixed(2)} rad/s`,
                    Spring_Period: `${((2 * Math.PI) / oscOmega).toFixed(2)} s`,
                    Pendulum_Period: `${(2 * Math.PI * Math.sqrt(pendulumL / 9.8)).toFixed(2)} s`,
                    Time_Avg_KE: `${(0.25 * springK * amplitudeA * amplitudeA).toFixed(1)} J`,
                    Position_Avg_KE: `${((1 / 3) * 0.5 * springK * amplitudeA * amplitudeA).toFixed(1)} J`,
                  }}
                />
              )}

              {subMode === 'lissajous' && (
                <FormulaHUD
                  title="Orthogonal Superposition Trajectory"
                  formulaLatex="x = A_x\sin(\omega_x t), \quad y = A_y\sin(\omega_y t + \delta)"
                  evaluatedValues={{
                    Frequency_Ratio: `${(omegaX / omegaY).toFixed(2)}`,
                    Phase_Shift: `${phaseDeltaDeg}° (${((phaseDeltaDeg * Math.PI) / 180).toFixed(2)} rad)`,
                    Trajectory_Form:
                      omegaX === omegaY
                        ? phaseDeltaDeg === 0 || phaseDeltaDeg === 180
                          ? 'Straight Line'
                          : phaseDeltaDeg === 90 || phaseDeltaDeg === 270
                          ? 'Ellipse / Circle'
                          : 'Oblique Ellipse'
                        : 'Lissajous Curve',
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
