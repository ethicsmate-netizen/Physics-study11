import React from 'react';

interface CalculusMotionGraphsProps {
  x0: number; // initial position (m)
  u: number;  // initial velocity (m/s)
  a: number;  // acceleration (m/s²)
  currentTime: number;
  totalDuration: number;
}

export const CalculusMotionGraphs: React.FC<CalculusMotionGraphsProps> = ({
  x0,
  u,
  a,
  currentTime,
  totalDuration = 8,
}) => {
  const tMax = Math.max(1, totalDuration);
  const tCur = Math.min(tMax, Math.max(0, currentTime));

  // Current values
  const currentX = x0 + u * tCur + 0.5 * a * tCur * tCur;
  const currentV = u + a * tCur;
  const currentA = a;
  const displacement = currentX - x0;

  // Graph geometry
  const width = 250;
  const height = 120;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 16;
  const padBottom = 22;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // 1. Calculate x(t) range
  const steps = 60;
  let minX = x0;
  let maxX = x0;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const xVal = x0 + u * t + 0.5 * a * t * t;
    if (xVal < minX) minX = xVal;
    if (xVal > maxX) maxX = xVal;
  }
  const xSpan = Math.max(10, (maxX - minX) * 1.25);
  const xCenter = (minX + maxX) / 2;
  const xPlotMin = xCenter - xSpan / 2;
  const xPlotMax = xCenter + xSpan / 2;

  const xPoints: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const xVal = x0 + u * t + 0.5 * a * t * t;
    const sx = padLeft + (t / tMax) * plotW;
    const sy = padTop + plotH - ((xVal - xPlotMin) / xSpan) * plotH;
    xPoints.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
  }

  // Tangent on x(t) at tCur
  const curSx = padLeft + (tCur / tMax) * plotW;
  const curSy = padTop + plotH - ((currentX - xPlotMin) / xSpan) * plotH;

  const dtSpan = tMax * 0.18;
  const t1 = Math.max(0, tCur - dtSpan);
  const t2 = Math.min(tMax, tCur + dtSpan);
  const x1 = currentX - currentV * (tCur - t1);
  const x2 = currentX + currentV * (t2 - tCur);
  const sx1 = padLeft + (t1 / tMax) * plotW;
  const sy1 = padTop + plotH - ((x1 - xPlotMin) / xSpan) * plotH;
  const sx2 = padLeft + (t2 / tMax) * plotW;
  const sy2 = padTop + plotH - ((x2 - xPlotMin) / xSpan) * plotH;

  // 2. Calculate v(t) range
  const vAt0 = u;
  const vAtEnd = u + a * tMax;
  const minV = Math.min(vAt0, vAtEnd, 0);
  const maxV = Math.max(vAt0, vAtEnd, 0);
  const vSpan = Math.max(10, (maxV - minV) * 1.3);
  const vPlotMin = Math.min(-2, minV - vSpan * 0.1);
  const vPlotMax = vPlotMin + vSpan;

  const vPoints: string[] = [];
  const vZeroSy = padTop + plotH - ((0 - vPlotMin) / vSpan) * plotH;
  const vCurSy = padTop + plotH - ((currentV - vPlotMin) / vSpan) * plotH;

  // Shaded area under v(t) curve from t=0 to t=tCur
  const areaPolygonPoints: string[] = [];
  areaPolygonPoints.push(`${padLeft},${vZeroSy.toFixed(1)}`);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tCur;
    const vVal = u + a * t;
    const sx = padLeft + (t / tMax) * plotW;
    const sy = padTop + plotH - ((vVal - vPlotMin) / vSpan) * plotH;
    areaPolygonPoints.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  areaPolygonPoints.push(`${curSx.toFixed(1)},${vZeroSy.toFixed(1)}`);

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tMax;
    const vVal = u + a * t;
    const sx = padLeft + (t / tMax) * plotW;
    const sy = padTop + plotH - ((vVal - vPlotMin) / vSpan) * plotH;
    vPoints.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
  }

  // 3. Calculate a(t) range
  const aSpan = Math.max(8, Math.abs(a) * 2.5);
  const aPlotMin = -aSpan / 2;
  const aZeroSy = padTop + plotH / 2;
  const aCurSy = padTop + plotH - ((a - aPlotMin) / aSpan) * plotH;

  const deltaV = a * tCur;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
      {/* 1. Position x(t) Graph */}
      <div className="bg-zinc-950/70 p-2.5 rounded border border-zinc-850 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
          <span className="text-zinc-300 font-medium">Position x(t)</span>
          <span className="text-emerald-400">x = {currentX.toFixed(1)} m</span>
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Axis */}
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />
          <line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Curve */}
          <polyline fill="none" stroke="#38bdf8" strokeWidth="1.8" points={xPoints.join(' ')} />

          {/* Dynamic Tangent Line (Slope = v) */}
          <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />

          {/* Current point */}
          <circle cx={curSx} cy={curSy} r="3.5" fill="#fafafa" stroke="#22c55e" strokeWidth="1.5" />

          {/* Axis labels */}
          <text x={padLeft - 4} y={padTop + 6} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {xPlotMax.toFixed(0)}
          </text>
          <text x={padLeft - 4} y={padTop + plotH} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {xPlotMin.toFixed(0)}
          </text>
          <text x={width - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {tMax.toFixed(0)}s
          </text>
        </svg>
        <div className="mt-1 text-[10px] font-mono text-zinc-400 flex items-center justify-between border-t border-zinc-850 pt-1">
          <span>Slope (dx/dt) = v</span>
          <span className="text-emerald-400">{currentV.toFixed(1)} m/s</span>
        </div>
      </div>

      {/* 2. Velocity v(t) Graph */}
      <div className="bg-zinc-950/70 p-2.5 rounded border border-zinc-850 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
          <span className="text-zinc-300 font-medium">Velocity v(t)</span>
          <span className="text-amber-400">v = {currentV.toFixed(1)} m/s</span>
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Zero line */}
          <line x1={padLeft} y1={vZeroSy} x2={width - padRight} y2={vZeroSy} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Shaded Area = Displacement */}
          <polygon points={areaPolygonPoints.join(' ')} fill="rgba(34, 197, 94, 0.18)" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="0.8" />

          {/* Curve */}
          <polyline fill="none" stroke="#f59e0b" strokeWidth="1.8" points={vPoints.join(' ')} />

          {/* Current point */}
          <circle cx={curSx} cy={vCurSy} r="3.5" fill="#fafafa" stroke="#f59e0b" strokeWidth="1.5" />

          {/* Axis labels */}
          <text x={padLeft - 4} y={padTop + 6} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {vPlotMax.toFixed(0)}
          </text>
          <text x={padLeft - 4} y={vZeroSy + 3} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            0
          </text>
          <text x={width - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {tMax.toFixed(0)}s
          </text>
        </svg>
        <div className="mt-1 text-[10px] font-mono text-zinc-400 flex items-center justify-between border-t border-zinc-850 pt-1">
          <span>Area (∫v dt) = Δx</span>
          <span className="text-emerald-400">{displacement.toFixed(1)} m</span>
        </div>
      </div>

      {/* 3. Acceleration a(t) Graph */}
      <div className="bg-zinc-950/70 p-2.5 rounded border border-zinc-850 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
          <span className="text-zinc-300 font-medium">Acceleration a(t)</span>
          <span className="text-indigo-400">a = {currentA.toFixed(1)} m/s²</span>
        </div>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Zero line */}
          <line x1={padLeft} y1={aZeroSy} x2={width - padRight} y2={aZeroSy} stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Shaded Area = Delta V */}
          <rect
            x={padLeft}
            y={Math.min(aZeroSy, aCurSy)}
            width={Math.max(0, curSx - padLeft)}
            height={Math.abs(aZeroSy - aCurSy)}
            fill="rgba(129, 140, 248, 0.18)"
            stroke="rgba(129, 140, 248, 0.4)"
            strokeWidth="0.8"
          />

          {/* Constant Acceleration line */}
          <line x1={padLeft} y1={aCurSy} x2={width - padRight} y2={aCurSy} stroke="#818cf8" strokeWidth="1.8" />

          {/* Current point */}
          <circle cx={curSx} cy={aCurSy} r="3.5" fill="#fafafa" stroke="#818cf8" strokeWidth="1.5" />

          {/* Axis labels */}
          <text x={padLeft - 4} y={aCurSy + 3} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {a.toFixed(1)}
          </text>
          <text x={width - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {tMax.toFixed(0)}s
          </text>
        </svg>
        <div className="mt-1 text-[10px] font-mono text-zinc-400 flex items-center justify-between border-t border-zinc-850 pt-1">
          <span>Area (∫a dt) = Δv</span>
          <span className="text-indigo-400">{deltaV.toFixed(1)} m/s</span>
        </div>
      </div>
    </div>
  );
};
