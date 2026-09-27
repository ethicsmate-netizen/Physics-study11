import React from 'react';

interface KinematicGraphsProps {
  velocity: number;
  angleDeg: number;
  gravity: number;
  currentTime: number;
  timeOfFlight: number;
  maxHeight: number;
  mass?: number;
}

export const KinematicGraphs: React.FC<KinematicGraphsProps> = ({
  velocity,
  angleDeg,
  gravity,
  currentTime,
  timeOfFlight,
  maxHeight,
  mass = 1,
}) => {
  const rad = (angleDeg * Math.PI) / 180;
  const ux = velocity * Math.cos(rad);
  const uy = velocity * Math.sin(rad);

  // Clamped time for indicator
  const clampedT = Math.min(timeOfFlight, Math.max(0, currentTime));
  const currentY = Math.max(0, uy * clampedT - 0.5 * gravity * clampedT * clampedT);
  const currentVy = uy - gravity * clampedT;

  const totalEnergy = 0.5 * mass * velocity * velocity;
  const currentK = 0.5 * mass * (ux * ux + currentVy * currentVy);
  const currentU = mass * gravity * currentY;

  // Graph plotting helpers
  const svgWidth = 260;
  const svgHeight = 110;
  const padLeft = 32;
  const padBottom = 20;
  const padTop = 15;
  const padRight = 15;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padBottom - padTop;

  // 1. Height vs Time y(t)
  const yPoints: string[] = [];
  const numSteps = 40;
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * timeOfFlight;
    const yVal = uy * t - 0.5 * gravity * t * t;
    const xPos = padLeft + (t / timeOfFlight) * plotW;
    const yPos = padTop + plotH - (Math.max(0, yVal) / (maxHeight || 1)) * plotH;
    yPoints.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
  }

  // 2. Vertical Velocity vs Time vy(t)
  const vyPoints: string[] = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * timeOfFlight;
    const vyVal = uy - gravity * t;
    const xPos = padLeft + (t / timeOfFlight) * plotW;
    // Map -uy to +uy
    const norm = (vyVal + uy) / (2 * uy || 1); // 1 at t=0, 0 at t=T
    const yPos = padTop + plotH - norm * plotH;
    vyPoints.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
  }

  const currentXPercent = timeOfFlight > 0 ? clampedT / timeOfFlight : 0;
  const indicatorX = padLeft + currentXPercent * plotW;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
      {/* Graph 1: Height y vs Time t */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-zinc-400">
          <span>Height y vs Time t</span>
          <span className="text-zinc-200">y={currentY.toFixed(1)}m</span>
        </div>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
          {/* Axes */}
          <line x1={padLeft} y1={padTop + plotH} x2={svgWidth - padRight} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Curve */}
          <polyline fill="none" stroke="#38bdf8" strokeWidth="1.5" points={yPoints.join(' ')} />

          {/* Time indicator line */}
          <line x1={indicatorX} y1={padTop} x2={indicatorX} y2={padTop + plotH} stroke="#fafafa" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={indicatorX} cy={padTop + plotH - (currentY / (maxHeight || 1)) * plotH} r="3" fill="#fafafa" />

          {/* Axis Labels */}
          <text x={padLeft - 4} y={padTop + 4} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {maxHeight.toFixed(0)}m
          </text>
          <text x={svgWidth - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {timeOfFlight.toFixed(1)}s
          </text>
        </svg>
      </div>

      {/* Graph 2: Vertical Velocity vy vs Time t */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-zinc-400">
          <span>Velocity vy vs Time t</span>
          <span className="text-zinc-200">vy={currentVy.toFixed(1)}m/s</span>
        </div>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
          {/* Zero line */}
          <line x1={padLeft} y1={padTop + plotH / 2} x2={svgWidth - padRight} y2={padTop + plotH / 2} stroke="#3f3f46" strokeWidth="1" strokeDasharray="2,2" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Curve */}
          <polyline fill="none" stroke="#22c55e" strokeWidth="1.5" points={vyPoints.join(' ')} />

          {/* Time indicator */}
          <line x1={indicatorX} y1={padTop} x2={indicatorX} y2={padTop + plotH} stroke="#fafafa" strokeWidth="1" strokeDasharray="2,2" />
          <circle cx={indicatorX} cy={padTop + plotH - ((currentVy + uy) / (2 * uy || 1)) * plotH} r="3" fill="#fafafa" />

          {/* Labels */}
          <text x={padLeft - 4} y={padTop + 4} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            +{uy.toFixed(0)}
          </text>
          <text x={padLeft - 4} y={padTop + plotH} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            -{uy.toFixed(0)}
          </text>
          <text x={svgWidth - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {timeOfFlight.toFixed(1)}s
          </text>
        </svg>
      </div>

      {/* Graph 3: Energy Conservation K, U, E vs Time */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-zinc-400">
          <span>Mechanical Energy</span>
          <span className="text-zinc-200">E={totalEnergy.toFixed(0)}J</span>
        </div>
        <div className="h-[75px] flex flex-col justify-center space-y-2 pt-1 px-1">
          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
              <span>Kinetic (K)</span>
              <span className="text-zinc-200">{currentK.toFixed(0)} J ({((currentK / totalEnergy) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(0, (currentK / totalEnergy) * 100))}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
              <span>Potential (U)</span>
              <span className="text-zinc-200">{currentU.toFixed(0)} J ({((currentU / totalEnergy) * 100).toFixed(0)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(0, (currentU / totalEnergy) * 100))}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 text-center mt-1 border-t border-zinc-850 pt-1">
          K + U = E_total (Conserved throughout trajectory)
        </div>
      </div>
    </div>
  );
};
