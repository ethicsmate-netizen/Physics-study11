import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { RotationalDynamicsTheory } from './RotationalDynamicsTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Trophy } from 'lucide-react';

interface RollingRacer {
  id: string;
  name: string;
  k2OverR2: number;
  color: string;
  dist: number; // meters traveled along ramp
  vel: number; // m/s
  rotAngle: number; // rad
  finishTime: number | null;
}

export interface RotationalDynamicsLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const RotationalDynamicsLab: React.FC<RotationalDynamicsLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [subMode, setSubMode] = useState<'incline_race' | 'rolling_wheel' | 'angular_momentum'>('incline_race');

  // SubMode 1: Incline Race State
  const [inclineAngleDeg, setInclineAngleDeg] = useState<number>(25); // degrees
  const [rampLength, setRampLength] = useState<number>(12); // meters
  const [frictionMu, setFrictionMu] = useState<number>(0.6);
  const [simTime, setSimTime] = useState<number>(0);

  const [racers, setRacers] = useState<RollingRacer[]>([
    { id: 'sphere', name: 'Solid Sphere (2/5)', k2OverR2: 0.4, color: '#38bdf8', dist: 0, vel: 0, rotAngle: 0, finishTime: null },
    { id: 'disc', name: 'Disc / Cylinder (1/2)', k2OverR2: 0.5, color: '#22c55e', dist: 0, vel: 0, rotAngle: 0, finishTime: null },
    { id: 'shell', name: 'Spherical Shell (2/3)', k2OverR2: 0.667, color: '#f59e0b', dist: 0, vel: 0, rotAngle: 0, finishTime: null },
    { id: 'ring', name: 'Ring / Hoop (1/1)', k2OverR2: 1.0, color: '#ec4899', dist: 0, vel: 0, rotAngle: 0, finishTime: null },
  ]);

  // SubMode 2: Rolling Wheel Velocity Field State
  const [wheelRadius, setWheelRadius] = useState<number>(1.8); // meters
  const [wheelAngularVel, setWheelAngularVel] = useState<number>(2.5); // rad/s
  const [wheelPosMeters, setWheelPosMeters] = useState<number>(0);
  const [showSuperposition, setShowSuperposition] = useState<boolean>(true);

  // SubMode 3: Angular Momentum / Turntable State
  const [skaterArmRadius, setSkaterArmRadius] = useState<number>(1.0); // meters (0.2 to 1.2)
  const [skaterDumbbellMass, setSkaterDumbbellMass] = useState<number>(4.0); // kg
  const [initialAngularVel, setInitialAngularVel] = useState<number>(2.0); // rad/s at r = 1.0m
  const [turntableAngle, setTurntableAngle] = useState<number>(0);

  // Playback & Viewport Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Reset Race
  const resetRace = useCallback(() => {
    setSimTime(0);
    setRacers(prev => prev.map(r => ({ ...r, dist: 0, vel: 0, rotAngle: 0, finishTime: null })));
  }, []);

  // Update physics loop
  const updatePhysics = useCallback((dt: number) => {
    const scaledDt = dt * playbackSpeed;

    if (subMode === 'incline_race') {
      setSimTime(t => t + scaledDt);
      const thetaRad = (inclineAngleDeg * Math.PI) / 180;
      const g = 9.8;
      const gSin = g * Math.sin(thetaRad);

      setRacers(prev => prev.map(racer => {
        if (racer.finishTime !== null) return racer;

        // Acceleration = g*sin(theta) / (1 + k^2/R^2)
        const acc = gSin / (1 + racer.k2OverR2);
        const newVel = racer.vel + acc * scaledDt;
        const newDist = racer.dist + newVel * scaledDt;
        const newRotAngle = racer.rotAngle + (newVel / 0.8) * scaledDt;

        if (newDist >= rampLength) {
          return {
            ...racer,
            dist: rampLength,
            vel: newVel,
            rotAngle: newRotAngle,
            finishTime: simTime + scaledDt,
          };
        }

        return {
          ...racer,
          dist: newDist,
          vel: newVel,
          rotAngle: newRotAngle,
        };
      }));
    } else if (subMode === 'rolling_wheel') {
      const vCm = wheelAngularVel * wheelRadius;
      setWheelPosMeters(x => {
        const next = x + vCm * scaledDt;
        return next > 8 ? -8 : next;
      });
    } else if (subMode === 'angular_momentum') {
      // Skater Turntable
      // Total L = I_total * omega = constant
      // I_base = 2.5 kg*m^2 (body/torso)
      // I_dumbbells = 2 * m * r^2
      // L0 computed at r = 1.0m: I0 = 2.5 + 2 * m * 1.0^2
      const I_base = 2.5;
      const I_initial = I_base + 2 * skaterDumbbellMass * 1.0 * 1.0;
      const L_conserved = I_initial * initialAngularVel;

      const I_current = I_base + 2 * skaterDumbbellMass * skaterArmRadius * skaterArmRadius;
      const currentOmega = L_conserved / I_current;

      setTurntableAngle(a => a + currentOmega * scaledDt);
    }
  }, [subMode, playbackSpeed, inclineAngleDeg, rampLength, simTime, wheelAngularVel, wheelRadius, skaterDumbbellMass, skaterArmRadius, initialAngularVel]);

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

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const coord = new CoordinateSystem({
      pixelsPerMeter: 36 * zoomLevel,
      originX: width / 2,
      originY: height / 2,
    });
    coord.drawGrid(ctx, width, height);

    if (subMode === 'incline_race') {
      const thetaRad = (inclineAngleDeg * Math.PI) / 180;
      const rampStartX = -8;
      const rampStartY = 3.5;
      const rampEndX = rampStartX + rampLength * Math.cos(thetaRad);
      const rampEndY = rampStartY - rampLength * Math.sin(thetaRad);

      const pStart = coord.worldToScreen(new Vector2D(rampStartX, rampStartY));
      const pEnd = coord.worldToScreen(new Vector2D(rampEndX, rampEndY));

      // Draw Ramp Incline Surface
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.lineTo(pStart.x, pEnd.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Finish line
      ctx.beginPath();
      ctx.moveTo(pEnd.x, pEnd.y - 40);
      ctx.lineTo(pEnd.x, pEnd.y + 10);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillText('FINISH LINE', pEnd.x - 28, pEnd.y - 46);

      // Draw the 4 Racers staggered along parallel tracks
      const bodyRadius = 0.55;
      racers.forEach((racer, idx) => {
        const laneOffsetPerp = (idx - 1.5) * 0.9;
        const normX = Math.sin(thetaRad);
        const normY = Math.cos(thetaRad);

        const currentRampX = rampStartX + racer.dist * Math.cos(thetaRad) + laneOffsetPerp * normX;
        const currentRampY = rampStartY - racer.dist * Math.sin(thetaRad) + laneOffsetPerp * normY + bodyRadius;

        const cPos = coord.worldToScreen(new Vector2D(currentRampX, currentRampY));
        const rScreen = bodyRadius * coord.pixelsPerMeter;

        // Draw rolling body circle
        ctx.beginPath();
        ctx.arc(cPos.x, cPos.y, rScreen, 0, Math.PI * 2);
        ctx.fillStyle = racer.color + '33';
        ctx.fill();
        ctx.strokeStyle = racer.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Spoke line to show rolling rotation
        ctx.beginPath();
        ctx.moveTo(cPos.x, cPos.y);
        ctx.lineTo(
          cPos.x + rScreen * Math.cos(racer.rotAngle),
          cPos.y + rScreen * Math.sin(racer.rotAngle)
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(racer.name.split(' ')[0], cPos.x, cPos.y - rScreen - 4);
      });
      ctx.restore();
    } else if (subMode === 'rolling_wheel') {
      const groundY = -2.0;
      const gLeft = coord.worldToScreen(new Vector2D(-12, groundY));
      const gRight = coord.worldToScreen(new Vector2D(12, groundY));

      ctx.save();
      // Ground Line
      ctx.beginPath();
      ctx.moveTo(gLeft.x, gLeft.y);
      ctx.lineTo(gRight.x, gRight.y);
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hatching
      for (let x = -12; x <= 12; x += 1.0) {
        const pt = coord.worldToScreen(new Vector2D(x, groundY));
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - 8, pt.y + 10);
        ctx.strokeStyle = 'rgba(113, 113, 122, 0.4)';
        ctx.stroke();
      }

      // Wheel Center
      const wheelCenterPos = new Vector2D(wheelPosMeters, groundY + wheelRadius);
      const cPos = coord.worldToScreen(wheelCenterPos);
      const rScreen = wheelRadius * coord.pixelsPerMeter;

      // Wheel body
      ctx.beginPath();
      ctx.arc(cPos.x, cPos.y, rScreen, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Spokes
      const angle = (wheelPosMeters / wheelRadius);
      for (let i = 0; i < 4; i++) {
        const a = angle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cPos.x, cPos.y);
        ctx.lineTo(cPos.x + rScreen * Math.cos(a), cPos.y + rScreen * Math.sin(a));
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Key Points
      const vCm = wheelAngularVel * wheelRadius;

      // Center C
      ctx.beginPath();
      ctx.arc(cPos.x, cPos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      const vCScreen = new Vector2D(vCm * coord.pixelsPerMeter * 0.25, 0);
      VectorRenderer.drawScreenVector(ctx, cPos, vCScreen, { color: '#38bdf8', lineWidth: 2.5, label: 'v_cm=ωR' });

      // Top Point A
      const topPos = coord.worldToScreen(new Vector2D(wheelPosMeters, groundY + 2 * wheelRadius));
      ctx.beginPath();
      ctx.arc(topPos.x, topPos.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      const vAScreen = new Vector2D(2 * vCm * coord.pixelsPerMeter * 0.25, 0);
      VectorRenderer.drawScreenVector(ctx, topPos, vAScreen, { color: '#22c55e', lineWidth: 3, label: 'v_top=2ωR' });

      // Contact Point P (Instantaneous Center of Rotation - ICR)
      const contactPos = coord.worldToScreen(new Vector2D(wheelPosMeters, groundY));
      ctx.beginPath();
      ctx.arc(contactPos.x, contactPos.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 10px ui-monospace, monospace';
      ctx.fillText('P (ICR: v_P = 0)', contactPos.x - 36, contactPos.y + 18);

      // Superposition Callout
      if (showSuperposition) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '11px ui-monospace, monospace';
        ctx.fillText('Pure Rolling = Translation of CM + Centroidal Rotation', 20, 30);
      }
      ctx.restore();
    } else if (subMode === 'angular_momentum') {
      // Skater / Rotating Turntable
      const centerPos = coord.worldToScreen(new Vector2D(0, 0));
      const I_base = 2.5;
      const I_initial = I_base + 2 * skaterDumbbellMass * 1.0 * 1.0;
      const L_conserved = I_initial * initialAngularVel;
      const I_current = I_base + 2 * skaterDumbbellMass * skaterArmRadius * skaterArmRadius;
      const currentOmega = L_conserved / I_current;

      ctx.save();
      // Turntable Disc
      const discR = 2.5 * coord.pixelsPerMeter;
      ctx.beginPath();
      ctx.arc(centerPos.x, centerPos.y, discR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(39, 39, 42, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotation indicator circle
      ctx.beginPath();
      ctx.arc(centerPos.x, centerPos.y, discR - 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Central Body (Torso)
      ctx.beginPath();
      ctx.arc(centerPos.x, centerPos.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating Arms & Dumbbells
      const armLengthScreen = skaterArmRadius * coord.pixelsPerMeter;
      const armCos = Math.cos(turntableAngle);
      const armSin = Math.sin(turntableAngle);

      // Arm Left
      const leftX = centerPos.x - armLengthScreen * armCos;
      const leftY = centerPos.y - armLengthScreen * armSin;
      // Arm Right
      const rightX = centerPos.x + armLengthScreen * armCos;
      const rightY = centerPos.y + armLengthScreen * armSin;

      ctx.beginPath();
      ctx.moveTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Dumbbell Weights
      [ { x: leftX, y: leftY }, { x: rightX, y: rightY } ].forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Angular velocity vector indicator in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`ω = ${currentOmega.toFixed(2)} rad/s`, centerPos.x, centerPos.y - discR - 15);
      ctx.restore();
    }
  }, [subMode, inclineAngleDeg, rampLength, racers, wheelRadius, wheelAngularVel, wheelPosMeters, showSuperposition, skaterArmRadius, skaterDumbbellMass, initialAngularVel, turntableAngle, zoomLevel]);

  // Derived Values
  const thetaRad = (inclineAngleDeg * Math.PI) / 180;
  const minMuSphere = Math.tan(thetaRad) / (1 + 1 / 0.4);
  const minMuRing = Math.tan(thetaRad) / (1 + 1 / 1.0);

  const I_base = 2.5;
  const I_initial = I_base + 2 * skaterDumbbellMass * 1.0 * 1.0;
  const L_conserved = I_initial * initialAngularVel;
  const I_current = I_base + 2 * skaterDumbbellMass * skaterArmRadius * skaterArmRadius;
  const currentOmega = L_conserved / I_current;
  const initialKE = 0.5 * I_initial * initialAngularVel * initialAngularVel;
  const currentKE = 0.5 * I_current * currentOmega * currentOmega;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              CH 08
            </span>
            <h1 className="text-sm font-medium text-zinc-100">
              Rotational Dynamics & Rolling Studio
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
                setSubMode('incline_race');
                resetRace();
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'incline_race'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Incline Pure Rolling Race
            </button>
            <button
              onClick={() => setSubMode('rolling_wheel')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'rolling_wheel'
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Rolling Wheel & IAR
            </button>
            <button
              onClick={() => setSubMode('angular_momentum')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'angular_momentum'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Angular Momentum Turntable
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {activeTab === 'theory' ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <RotationalDynamicsTheory onNavigateChapter={onNavigateChapter} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas Viewport */}
          <div className="flex-1 relative flex flex-col bg-[#09090b] border-r border-zinc-800/80">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 backdrop-blur text-[11px] font-mono text-zinc-300">
                {subMode === 'incline_race' && 'Race down incline: a = g·sin(θ) / (1 + k²/R²)'}
                {subMode === 'rolling_wheel' && `Pure Rolling: v_cm = ${(wheelAngularVel * wheelRadius).toFixed(2)} m/s | v_top = ${(2 * wheelAngularVel * wheelRadius).toFixed(2)} m/s`}
                {subMode === 'angular_momentum' && `Conservation of L: I_curr = ${I_current.toFixed(2)} kg·m² | ω = ${currentOmega.toFixed(2)} rad/s`}
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
                onReset={() => {
                  setIsPlaying(false);
                  if (subMode === 'incline_race') resetRace();
                  if (subMode === 'rolling_wheel') setWheelPosMeters(0);
                  if (subMode === 'angular_momentum') setTurntableAngle(0);
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
            {subMode === 'incline_race' && (
              <>
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-zinc-300">Incline Parameters</span>
                  <SliderControl
                    label="Incline Angle (θ)"
                    value={inclineAngleDeg}
                    min={10}
                    max={45}
                    step={1}
                    unit="°"
                    onChange={(v) => {
                      setInclineAngleDeg(v);
                      resetRace();
                    }}
                  />
                  <SliderControl
                    label="Ramp Track Length (L)"
                    value={rampLength}
                    min={6}
                    max={20}
                    step={1}
                    unit="m"
                    onChange={(v) => {
                      setRampLength(v);
                      resetRace();
                    }}
                  />
                  <SliderControl
                    label="Friction Coefficient (μ_s)"
                    value={frictionMu}
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    unit=""
                    onChange={setFrictionMu}
                  />
                </div>

                {/* Live Race Leaderboard */}
                <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      Live Race Leaderboard
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      t = {simTime.toFixed(2)}s
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[...racers].sort((a, b) => b.dist - a.dist).map((r, rank) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-850 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-zinc-500 text-[11px]">#{rank + 1}</span>
                          <span style={{ color: r.color }} className="font-medium">
                            {r.name}
                          </span>
                        </div>
                        <div className="font-mono text-zinc-400 text-[11px]">
                          {r.finishTime !== null ? (
                            <span className="text-emerald-400 font-bold">{r.finishTime.toFixed(2)}s</span>
                          ) : (
                            <span>{r.dist.toFixed(1)}m</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {subMode === 'rolling_wheel' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300">Wheel Parameters</span>
                <SliderControl
                  label="Wheel Radius (R)"
                  value={wheelRadius}
                  min={1.0}
                  max={3.0}
                  step={0.2}
                  unit="m"
                  onChange={setWheelRadius}
                />
                <SliderControl
                  label="Angular Velocity (ω)"
                  value={wheelAngularVel}
                  min={0.5}
                  max={6.0}
                  step={0.5}
                  unit="rad/s"
                  onChange={setWheelAngularVel}
                />
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSuperposition}
                      onChange={(e) => setShowSuperposition(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-sky-500 focus:ring-0"
                    />
                    <span>Show Superposition Decomposition HUD</span>
                  </label>
                </div>
              </div>
            )}

            {subMode === 'angular_momentum' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300">Turntable & Skater</span>
                <SliderControl
                  label="Arm Extension Radius (r)"
                  value={skaterArmRadius}
                  min={0.25}
                  max={1.2}
                  step={0.05}
                  unit="m"
                  onChange={setSkaterArmRadius}
                />
                <SliderControl
                  label="Dumbbell Mass (each)"
                  value={skaterDumbbellMass}
                  min={1.0}
                  max={10.0}
                  step={0.5}
                  unit="kg"
                  onChange={setSkaterDumbbellMass}
                />
                <SliderControl
                  label="Initial Angular Speed (ω0)"
                  value={initialAngularVel}
                  min={0.5}
                  max={5.0}
                  step={0.5}
                  unit="rad/s"
                  onChange={setInitialAngularVel}
                />
              </div>
            )}

            {/* Live Formula HUD */}
            <div className="pt-2">
              {subMode === 'incline_race' && (
                <FormulaHUD
                  title="Incline Rolling Acceleration & Friction Limit"
                  formulaLatex="a = \frac{g\sin\theta}{1 + \frac{k^2}{R^2}}, \quad \mu_{\min} = \frac{\tan\theta}{1 + \frac{R^2}{k^2}}"
                  evaluatedValues={{
                    Solid_Sphere_a: `${( (9.8 * Math.sin(thetaRad)) / 1.4 ).toFixed(2)} m/s²`,
                    Disc_a: `${( (9.8 * Math.sin(thetaRad)) / 1.5 ).toFixed(2)} m/s²`,
                    Hoop_a: `${( (9.8 * Math.sin(thetaRad)) / 2.0 ).toFixed(2)} m/s²`,
                    Min_Mu_Sphere: minMuSphere.toFixed(3),
                    Min_Mu_Ring: minMuRing.toFixed(3),
                  }}
                />
              )}

              {subMode === 'rolling_wheel' && (
                <FormulaHUD
                  title="Rolling Without Slipping Velocity Field"
                  formulaLatex="v_{\text{top}} = 2\omega R, \quad v_{\text{cm}} = \omega R, \quad v_{\text{bottom}} = 0"
                  evaluatedValues={{
                    Radius: `${wheelRadius.toFixed(2)} m`,
                    Omega: `${wheelAngularVel.toFixed(2)} rad/s`,
                    V_CM: `${(wheelAngularVel * wheelRadius).toFixed(2)} m/s`,
                    V_Top: `${(2 * wheelAngularVel * wheelRadius).toFixed(2)} m/s`,
                    Contact_Point: '0.00 m/s (ICR)',
                  }}
                />
              )}

              {subMode === 'angular_momentum' && (
                <FormulaHUD
                  title="Angular Momentum Conservation & Muscular Work"
                  formulaLatex="I_1 \omega_1 = I_2 \omega_2, \quad K = \frac{L^2}{2I}"
                  evaluatedValues={{
                    Conserved_L: `${L_conserved.toFixed(2)} kg·m²/s`,
                    Current_Inertia: `${I_current.toFixed(2)} kg·m²`,
                    Current_Omega: `${currentOmega.toFixed(2)} rad/s`,
                    Initial_KE: `${initialKE.toFixed(1)} J`,
                    Current_KE: `${currentKE.toFixed(1)} J`,
                    Work_Done_By_Muscles: `${(currentKE - initialKE).toFixed(1)} J`,
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
