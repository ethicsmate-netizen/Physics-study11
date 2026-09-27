import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { CoordinateSystem } from '../../core/canvas/CoordinateSystem';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';
import { PhysicsLoop } from '../../core/physics/PhysicsLoop';
import { PlaybackControls } from '../../components/common/PlaybackControls';
import { SliderControl } from '../../components/common/SliderControl';
import { FormulaHUD } from '../../components/common/FormulaHUD';
import { ThermodynamicsTheory } from './ThermodynamicsTheory';
import { ZoomIn, ZoomOut, Maximize2, Activity, BookOpen, Flame, Layers, Gauge } from 'lucide-react';

export interface ThermodynamicsLabProps {
  initialTab?: 'simulation' | 'theory';
  onNavigateChapter?: (chapterId: string, tab?: 'simulation' | 'theory') => void;
}

export const ThermodynamicsLab: React.FC<ThermodynamicsLabProps> = ({ initialTab = 'simulation', onNavigateChapter }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'theory'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const [subMode, setSubMode] = useState<'pv_cycles' | 'elasticity_wire' | 'thermal_conduction'>('pv_cycles');

  // SubMode 1: PV Cycle Engine
  const cycleType = 'carnot';
  const [tempHigh, setTempHigh] = useState<number>(600); // K (T_H)
  const [tempLow, setTempLow] = useState<number>(300); // K (T_C)
  const [gasMoles, setGasMoles] = useState<number>(1.0); // moles
  const [gammaRatio, setGammaRatio] = useState<number>(1.4); // adiabatic index
  const [cycleProgress, setCycleProgress] = useState<number>(0); // 0 to 1

  // SubMode 2: Elasticity Wire
  const [wireMaterial, setWireMaterial] = useState<'steel' | 'copper' | 'aluminium'>('steel');
  const [wireOriginalL, setWireOriginalL] = useState<number>(2.0); // m
  const [wireRadiusMm, setWireRadiusMm] = useState<number>(1.0); // mm
  const [hangingMassKg, setHangingMassKg] = useState<number>(50); // kg

  // SubMode 3: Thermal Conduction Junction
  const [tempEnd1, setTempEnd1] = useState<number>(100); // °C (Left Rod)
  const [tempEnd2, setTempEnd2] = useState<number>(0); // °C (Right Rod)
  const [tempEnd3, setTempEnd3] = useState<number>(50); // °C (Top Rod)
  const [condK1, setCondK1] = useState<number>(400); // W/mK (Copper)
  const [condK2, setCondK2] = useState<number>(200); // W/mK (Aluminium)
  const [condK3, setCondK3] = useState<number>(50); // W/mK (Steel)

  // Common Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<PhysicsLoop | null>(null);

  // Material Young's Modulus (N/m^2)
  const youngModulusMap = {
    steel: 2.0e11,
    copper: 1.1e11,
    aluminium: 0.7e11,
  };

  // Update physics loop
  const updatePhysics = useCallback((dt: number) => {
    const scaledDt = dt * playbackSpeed;
    if (subMode === 'pv_cycles' && isPlaying) {
      setCycleProgress(prev => (prev + 0.12 * scaledDt) % 1.0);
    }
  }, [subMode, isPlaying, playbackSpeed]);

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

  // Derived Calculations
  // 1. Carnot Cycle Calculations
  const carnotEfficiency = 1 - tempLow / tempHigh;
  const R_GAS = 8.314;
  // Volume expansion ratio along isotherm 1->2
  const v1 = 1.0;
  const v2 = 2.2;
  // Adiabatic expansion 2->3: T_H * V2^(gamma-1) = T_C * V3^(gamma-1)
  const v3 = v2 * Math.pow(tempHigh / tempLow, 1 / (gammaRatio - 1));
  const v4 = v1 * Math.pow(tempHigh / tempLow, 1 / (gammaRatio - 1));

  const p1 = (gasMoles * R_GAS * tempHigh) / v1;
  const p2 = (gasMoles * R_GAS * tempHigh) / v2;
  const p3 = (gasMoles * R_GAS * tempLow) / v3;
  const p4 = (gasMoles * R_GAS * tempLow) / v4;

  const qInCarnot = gasMoles * R_GAS * tempHigh * Math.log(v2 / v1);
  const qOutCarnot = gasMoles * R_GAS * tempLow * Math.log(v3 / v4);
  const netWorkCarnot = qInCarnot - qOutCarnot;

  // Current State in Cycle
  let curP = p1;
  let curV = v1;
  let curT = tempHigh;
  if (subMode === 'pv_cycles') {
    const p = cycleProgress;
    if (p < 0.25) {
      // Stage 1: Isothermal Expansion at T_H (1 -> 2)
      const frac = p / 0.25;
      curV = v1 + frac * (v2 - v1);
      curP = (gasMoles * R_GAS * tempHigh) / curV;
      curT = tempHigh;
    } else if (p < 0.5) {
      // Stage 2: Adiabatic Expansion (2 -> 3)
      const frac = (p - 0.25) / 0.25;
      curV = v2 + frac * (v3 - v2);
      curP = p2 * Math.pow(v2 / curV, gammaRatio);
      curT = (curP * curV) / (gasMoles * R_GAS);
    } else if (p < 0.75) {
      // Stage 3: Isothermal Compression at T_C (3 -> 4)
      const frac = (p - 0.5) / 0.25;
      curV = v3 - frac * (v3 - v4);
      curP = (gasMoles * R_GAS * tempLow) / curV;
      curT = tempLow;
    } else {
      // Stage 4: Adiabatic Compression (4 -> 1)
      const frac = (p - 0.75) / 0.25;
      curV = v4 - frac * (v4 - v1);
      curP = p4 * Math.pow(v4 / curV, gammaRatio);
      curT = (curP * curV) / (gasMoles * R_GAS);
    }
  }

  // 2. Elasticity Wire Calculations
  const wireArea = Math.PI * Math.pow((wireRadiusMm * 1e-3), 2);
  const Y_val = youngModulusMap[wireMaterial];
  const tensileForce = hangingMassKg * 9.8;
  const wireStress = tensileForce / wireArea;
  const wireStrain = wireStress / Y_val;
  const wireDeltaL = wireOriginalL * wireStrain;
  const wireEnergy = 0.5 * tensileForce * wireDeltaL;

  // 3. Thermal Conduction Junction (Kirchhoff's rule)
  // (T1 - T0)/R1 + (T2 - T0)/R2 + (T3 - T0)/R3 = 0
  // R = L / (K * A). For identical L and A: (T1 - T0)*K1 + (T2 - T0)*K2 + (T3 - T0)*K3 = 0
  const junctionTempC = (tempEnd1 * condK1 + tempEnd2 * condK2 + tempEnd3 * condK3) / (condK1 + condK2 + condK3);
  const heatCurrent1 = condK1 * (tempEnd1 - junctionTempC);
  const heatCurrent2 = condK2 * (junctionTempC - tempEnd2);
  const heatCurrent3 = condK3 * (tempEnd3 - junctionTempC);

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

    if (subMode === 'pv_cycles') {
      ctx.save();
      // Left Side: PV Indicator Diagram
      const pvOrigin = coord.worldToScreen(new Vector2D(-7.0, -3.0));
      const pvWidth = 240;
      const pvHeight = 220;

      // Draw PV Axes
      ctx.beginPath();
      ctx.moveTo(pvOrigin.x, pvOrigin.y);
      ctx.lineTo(pvOrigin.x + pvWidth, pvOrigin.y); // V axis
      ctx.moveTo(pvOrigin.x, pvOrigin.y);
      ctx.lineTo(pvOrigin.x, pvOrigin.y - pvHeight); // P axis
      ctx.strokeStyle = '#a1a1aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '10px ui-monospace, monospace';
      ctx.fillText('Volume (V) →', pvOrigin.x + pvWidth - 65, pvOrigin.y + 18);
      ctx.fillText('↑ Pressure (P)', pvOrigin.x + 8, pvOrigin.y - pvHeight + 12);

      // Mapping from (V, P) to screen
      const mapPV = (v: number, p: number) => {
        const normV = Math.min(1, Math.max(0, (v - 0.5) / 6.0));
        const normP = Math.min(1, Math.max(0, (p - 2000) / 6000));
        return {
          x: pvOrigin.x + normV * (pvWidth - 20) + 10,
          y: pvOrigin.y - normP * (pvHeight - 20) - 10,
        };
      };

      // Draw Carnot Cycle closed curve
      const samples = 100;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const pFrac = i / samples;
        let vI = v1, pI = p1;
        if (pFrac < 0.25) {
          const f = pFrac / 0.25;
          vI = v1 + f * (v2 - v1);
          pI = (gasMoles * R_GAS * tempHigh) / vI;
        } else if (pFrac < 0.5) {
          const f = (pFrac - 0.25) / 0.25;
          vI = v2 + f * (v3 - v2);
          pI = p2 * Math.pow(v2 / vI, gammaRatio);
        } else if (pFrac < 0.75) {
          const f = (pFrac - 0.5) / 0.25;
          vI = v3 - f * (v3 - v4);
          pI = (gasMoles * R_GAS * tempLow) / vI;
        } else {
          const f = (pFrac - 0.75) / 0.25;
          vI = v4 - f * (v4 - v1);
          pI = p4 * Math.pow(v4 / vI, gammaRatio);
        }
        const s = mapPV(vI, pI);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Current State Point on PV Curve
      const curPt = mapPV(curV, curP);
      ctx.beginPath();
      ctx.arc(curPt.x, curPt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Right Side: Animated Piston Cylinder Chamber
      const pistonOrigin = coord.worldToScreen(new Vector2D(4.0, 1.0));
      const cylWidth = 140;
      const cylMaxHeight = 180;
      const pistonHeight = (curV / 6.0) * cylMaxHeight;

      // Cylinder Walls
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 4;
      ctx.strokeRect(pistonOrigin.x - cylWidth / 2, pistonOrigin.y - cylMaxHeight, cylWidth, cylMaxHeight);

      // Gas Volume (Chamber fill)
      ctx.fillStyle = curT > (tempHigh + tempLow) / 2 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(
        pistonOrigin.x - cylWidth / 2 + 2,
        pistonOrigin.y - pistonHeight,
        cylWidth - 4,
        pistonHeight
      );

      // Piston Head
      ctx.fillStyle = '#3f3f46';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.fillRect(pistonOrigin.x - cylWidth / 2 + 2, pistonOrigin.y - pistonHeight - 16, cylWidth - 4, 16);
      ctx.strokeRect(pistonOrigin.x - cylWidth / 2 + 2, pistonOrigin.y - pistonHeight - 16, cylWidth - 4, 16);

      // Piston Rod
      ctx.fillRect(pistonOrigin.x - 6, pistonOrigin.y - pistonHeight - 65, 12, 50);

      // Temperature Flame / Ice below cylinder
      ctx.fillStyle = curT > (tempHigh + tempLow) / 2 ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        curT > (tempHigh + tempLow) / 2 ? `🔥 Hot Reservoir T_H = ${tempHigh}K` : `❄️ Cold Reservoir T_C = ${tempLow}K`,
        pistonOrigin.x,
        pistonOrigin.y + 24
      );

      ctx.restore();
    } else if (subMode === 'elasticity_wire') {
      ctx.save();
      // Ceiling anchor
      const ceilY = 3.5;
      const ceilScreen = coord.worldToScreen(new Vector2D(0, ceilY));
      ctx.beginPath();
      ctx.moveTo(ceilScreen.x - 70, ceilScreen.y);
      ctx.lineTo(ceilScreen.x + 70, ceilScreen.y);
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Hatch marks for ceiling
      for (let x = -70; x <= 70; x += 12) {
        ctx.beginPath();
        ctx.moveTo(ceilScreen.x + x, ceilScreen.y);
        ctx.lineTo(ceilScreen.x + x + 8, ceilScreen.y - 10);
        ctx.strokeStyle = 'rgba(113, 113, 122, 0.5)';
        ctx.stroke();
      }

      // Stretched Wire
      const wireBottomY = ceilY - (wireOriginalL + wireDeltaL * 50); // magnified elongation for visibility
      const bottomScreen = coord.worldToScreen(new Vector2D(0, wireBottomY));

      ctx.beginPath();
      ctx.moveTo(ceilScreen.x, ceilScreen.y);
      ctx.lineTo(bottomScreen.x, bottomScreen.y);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = Math.max(2, wireRadiusMm * 2);
      ctx.stroke();

      // Hanging Load (Cylinder/Weight)
      const loadW = 60;
      const loadH = 50;
      ctx.fillStyle = '#27272a';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.fillRect(bottomScreen.x - loadW / 2, bottomScreen.y, loadW, loadH);
      ctx.strokeRect(bottomScreen.x - loadW / 2, bottomScreen.y, loadW, loadH);

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${hangingMassKg} kg`, bottomScreen.x, bottomScreen.y + 28);

      // Force Arrow Downward (W = mg)
      const forceArrow = new Vector2D(0, 50);
      VectorRenderer.drawScreenVector(ctx, new Vector2D(bottomScreen.x, bottomScreen.y + loadH), forceArrow, {
        color: '#ef4444',
        lineWidth: 2.5,
        label: `W = ${(hangingMassKg * 9.8).toFixed(0)} N`,
      });

      // Elongation Callout
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`ΔL = ${(wireDeltaL * 1e3).toFixed(3)} mm`, bottomScreen.x + 40, bottomScreen.y + 10);
      ctx.fillText(`Stress = ${(wireStress / 1e6).toFixed(1)} MPa`, bottomScreen.x + 40, bottomScreen.y + 26);

      ctx.restore();
    } else if (subMode === 'thermal_conduction') {
      ctx.save();
      // Star Junction with 3 Rods (Allen Illustration 15)
      const junctionPos = coord.worldToScreen(new Vector2D(0, 0));
      const rodLengthScreen = 140;

      // End 1 (Left - Copper)
      const end1 = new Vector2D(junctionPos.x - rodLengthScreen, junctionPos.y);
      // End 2 (Right - Aluminium)
      const end2 = new Vector2D(junctionPos.x + rodLengthScreen, junctionPos.y);
      // End 3 (Top - Steel)
      const end3 = new Vector2D(junctionPos.x, junctionPos.y - rodLengthScreen);

      // Rod 1 (Copper)
      ctx.beginPath();
      ctx.moveTo(end1.x, end1.y);
      ctx.lineTo(junctionPos.x, junctionPos.y);
      ctx.strokeStyle = '#f59e0b'; // Copper Amber
      ctx.lineWidth = 14;
      ctx.stroke();

      // Rod 2 (Aluminium)
      ctx.beginPath();
      ctx.moveTo(end2.x, end2.y);
      ctx.lineTo(junctionPos.x, junctionPos.y);
      ctx.strokeStyle = '#38bdf8'; // Aluminium Cyan
      ctx.lineWidth = 14;
      ctx.stroke();

      // Rod 3 (Steel)
      ctx.beginPath();
      ctx.moveTo(end3.x, end3.y);
      ctx.lineTo(junctionPos.x, junctionPos.y);
      ctx.strokeStyle = '#a1a1aa'; // Steel Silver
      ctx.lineWidth = 14;
      ctx.stroke();

      // Common Junction Node
      ctx.beginPath();
      ctx.arc(junctionPos.x, junctionPos.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${junctionTempC.toFixed(1)}°C`, junctionPos.x, junctionPos.y + 4);

      // End Terminal Labels
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Copper: ${tempEnd1}°C`, end1.x - 20, end1.y - 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Aluminium: ${tempEnd2}°C`, end2.x + 20, end2.y - 14);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(`Steel: ${tempEnd3}°C`, end3.x, end3.y - 16);

      // Thermal Currents Arrows
      const arrow1 = new Vector2D((junctionPos.x - end1.x) * 0.4, 0);
      VectorRenderer.drawScreenVector(ctx, new Vector2D(end1.x + 30, end1.y - 20), arrow1, { color: '#f59e0b', lineWidth: 2, label: `H1` });

      ctx.restore();
    }
  }, [subMode, cycleType, tempHigh, tempLow, gasMoles, gammaRatio, cycleProgress, curP, curV, curT, wireMaterial, wireOriginalL, wireRadiusMm, hangingMassKg, wireStress, wireDeltaL, tempEnd1, tempEnd2, tempEnd3, condK1, condK2, condK3, junctionTempC, zoomLevel]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              CH 10
            </span>
            <h1 className="text-sm font-medium text-zinc-100">
              Elasticity, Heat & Thermodynamics Studio
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
              onClick={() => setSubMode('pv_cycles')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'pv_cycles'
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              P-V Carnot Engine
            </button>
            <button
              onClick={() => setSubMode('elasticity_wire')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'elasticity_wire'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Elastic Stress & Strain
            </button>
            <button
              onClick={() => setSubMode('thermal_conduction')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                subMode === 'thermal_conduction'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Thermal Conduction Junction
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      {activeTab === 'theory' ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <ThermodynamicsTheory onNavigateChapter={onNavigateChapter} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Canvas Viewport */}
          <div className="flex-1 relative flex flex-col bg-[#09090b] border-r border-zinc-800/80">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <div className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 backdrop-blur text-[11px] font-mono text-zinc-300">
                {subMode === 'pv_cycles' && `Carnot Cycle: η = ${(carnotEfficiency * 100).toFixed(1)}% | T = ${curT.toFixed(0)} K | P = ${(curP).toFixed(0)} Pa`}
                {subMode === 'elasticity_wire' && `Young's Modulus: ${(Y_val / 1e9).toFixed(0)} GPa | Stress: ${(wireStress / 1e6).toFixed(1)} MPa | Strain: ${(wireStrain * 1e4).toFixed(2)}×10⁻⁴`}
                {subMode === 'thermal_conduction' && `Junction Temp: ${junctionTempC.toFixed(2)} °C | Kirchhoff Heat Current Balanced (Σ H = 0)`}
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
                  setCycleProgress(0);
                }}
                onStep={() => updatePhysics(0.016)}
                timeScale={playbackSpeed}
                onTimeScaleChange={setPlaybackSpeed}
                currentTime={cycleProgress * 10}
              />
            </div>
          </div>

          {/* Right Sidebar Controls & HUD */}
          <div className="w-full lg:w-96 p-5 bg-zinc-950/60 overflow-y-auto space-y-5 border-l border-zinc-800/60">
            {subMode === 'pv_cycles' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Carnot Engine Parameters
                </span>
                <SliderControl
                  label="Hot Reservoir Temp (T_H)"
                  value={tempHigh}
                  min={400}
                  max={900}
                  step={25}
                  unit="K"
                  onChange={setTempHigh}
                />
                <SliderControl
                  label="Cold Reservoir Temp (T_C)"
                  value={tempLow}
                  min={200}
                  max={380}
                  step={10}
                  unit="K"
                  onChange={setTempLow}
                />
                <SliderControl
                  label="Gas Amount (n)"
                  value={gasMoles}
                  min={0.5}
                  max={3.0}
                  step={0.5}
                  unit="mol"
                  onChange={setGasMoles}
                />
                <SliderControl
                  label="Adiabatic Index (γ)"
                  value={gammaRatio}
                  min={1.2}
                  max={1.67}
                  step={0.07}
                  unit=""
                  onChange={setGammaRatio}
                />
              </div>
            )}

            {subMode === 'elasticity_wire' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Wire & Tensile Load
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs">
                  <button
                    onClick={() => setWireMaterial('steel')}
                    className={`py-1.5 rounded text-center transition-all ${
                      wireMaterial === 'steel' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Steel
                  </button>
                  <button
                    onClick={() => setWireMaterial('copper')}
                    className={`py-1.5 rounded text-center transition-all ${
                      wireMaterial === 'copper' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Copper
                  </button>
                  <button
                    onClick={() => setWireMaterial('aluminium')}
                    className={`py-1.5 rounded text-center transition-all ${
                      wireMaterial === 'aluminium' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Aluminium
                  </button>
                </div>

                <SliderControl
                  label="Wire Original Length (L0)"
                  value={wireOriginalL}
                  min={1.0}
                  max={5.0}
                  step={0.5}
                  unit="m"
                  onChange={setWireOriginalL}
                />
                <SliderControl
                  label="Wire Radius (r)"
                  value={wireRadiusMm}
                  min={0.5}
                  max={3.0}
                  step={0.25}
                  unit="mm"
                  onChange={setWireRadiusMm}
                />
                <SliderControl
                  label="Hanging Mass (M)"
                  value={hangingMassKg}
                  min={10}
                  max={250}
                  step={10}
                  unit="kg"
                  onChange={setHangingMassKg}
                />
              </div>
            )}

            {subMode === 'thermal_conduction' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  Thermal Conduction Network
                </span>
                <SliderControl
                  label="Left End Temp (T1)"
                  value={tempEnd1}
                  min={60}
                  max={150}
                  step={5}
                  unit="°C"
                  onChange={setTempEnd1}
                />
                <SliderControl
                  label="Right End Temp (T2)"
                  value={tempEnd2}
                  min={-20}
                  max={40}
                  step={5}
                  unit="°C"
                  onChange={setTempEnd2}
                />
                <SliderControl
                  label="Top End Temp (T3)"
                  value={tempEnd3}
                  min={20}
                  max={100}
                  step={5}
                  unit="°C"
                  onChange={setTempEnd3}
                />
                <SliderControl
                  label="Copper Cond. (K1)"
                  value={condK1}
                  min={200}
                  max={500}
                  step={20}
                  unit="W/mK"
                  onChange={setCondK1}
                />
                <SliderControl
                  label="Aluminium Cond. (K2)"
                  value={condK2}
                  min={100}
                  max={300}
                  step={20}
                  unit="W/mK"
                  onChange={setCondK2}
                />
                <SliderControl
                  label="Steel Cond. (K3)"
                  value={condK3}
                  min={20}
                  max={100}
                  step={5}
                  unit="W/mK"
                  onChange={setCondK3}
                />
              </div>
            )}

            {/* Live Formula HUD */}
            <div className="pt-2">
              {subMode === 'pv_cycles' && (
                <FormulaHUD
                  title="Carnot Engine Thermodynamic Efficiency"
                  formulaLatex="\eta = 1 - \frac{T_C}{T_H} = \frac{W_{\text{net}}}{Q_{\text{in}}}"
                  evaluatedValues={{
                    Efficiency: `${(carnotEfficiency * 100).toFixed(1)}%`,
                    Heat_Input_Qin: `${qInCarnot.toFixed(0)} J`,
                    Heat_Rejected_Qout: `${qOutCarnot.toFixed(0)} J`,
                    Net_Work_W: `${netWorkCarnot.toFixed(0)} J`,
                    Current_State_T: `${curT.toFixed(0)} K`,
                    Minimum_Cycle_P: `${p3.toFixed(0)} Pa`,
                  }}
                />
              )}

              {subMode === 'elasticity_wire' && (
                <FormulaHUD
                  title="Hooke's Law & Elastic Potential Energy"
                  formulaLatex="Y = \frac{F L_0}{A \Delta L}, \quad U = \frac{1}{2} F \Delta L"
                  evaluatedValues={{
                    Tensile_Stress: `${(wireStress / 1e6).toFixed(1)} MPa`,
                    Tensile_Strain: `${(wireStrain * 1e4).toFixed(2)} × 10⁻⁴`,
                    Elongation_DeltaL: `${(wireDeltaL * 1e3).toFixed(3)} mm`,
                    Stored_Energy: `${wireEnergy.toFixed(3)} J`,
                  }}
                />
              )}

              {subMode === 'thermal_conduction' && (
                <FormulaHUD
                  title="Kirchhoff's Thermal Junction Rule"
                  formulaLatex="\Sigma H_i = \Sigma \frac{K_i A}{L_i}(T_i - T_{\text{junction}}) = 0"
                  evaluatedValues={{
                    Junction_Temp: `${junctionTempC.toFixed(2)} °C`,
                    Heat_Flow_1: `${heatCurrent1.toFixed(0)} W/m²`,
                    Heat_Flow_2: `${heatCurrent2.toFixed(0)} W/m²`,
                    Heat_Flow_3: `${heatCurrent3.toFixed(0)} W/m²`,
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
