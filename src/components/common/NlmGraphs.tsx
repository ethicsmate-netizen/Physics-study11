import React from 'react';

interface NlmGraphsProps {
  mass1: number;
  gravity: number;
  inclineAngleDeg: number;
  muStatic: number;
  muKinetic: number;
  currentTime: number;
  currentVelocity: number;
  acceleration: number;
}

export const NlmGraphs: React.FC<NlmGraphsProps> = ({
  mass1,
  gravity,
  inclineAngleDeg,
  muStatic,
  muKinetic,
  currentTime,
  currentVelocity,
  acceleration,
}) => {
  // Graph dimensions
  const svgWidth = 280;
  const svgHeight = 120;
  const padLeft = 36;
  const padBottom = 22;
  const padTop = 15;
  const padRight = 15;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padBottom - padTop;

  // Angle of Repose (degrees)
  const angleOfReposeDeg = (Math.atan(muStatic) * 180) / Math.PI;

  // Max possible friction for scaling = muStatic * m * g
  const maxPossibleFriction = Math.max(1, muStatic * mass1 * gravity);
  const maxPossibleAcc = Math.max(1, gravity);

  // 1. Plot Friction f vs Incline Angle theta (0° to 90°)
  // According to Page 126 Allen Notes:
  // For theta <= angleOfRepose: f_s = m*g*sin(theta)
  // For theta > angleOfRepose: f_k = mu_k * m * g * cos(theta)
  const frictionPoints: string[] = [];
  const numSteps = 60;
  for (let i = 0; i <= numSteps; i++) {
    const deg = (i / numSteps) * 90;
    const rad = (deg * Math.PI) / 180;
    let fVal = 0;
    if (deg <= angleOfReposeDeg) {
      fVal = mass1 * gravity * Math.sin(rad);
    } else {
      fVal = muKinetic * mass1 * gravity * Math.cos(rad);
    }
    const xPos = padLeft + (deg / 90) * plotW;
    const yPos = padTop + plotH - (fVal / maxPossibleFriction) * plotH;
    frictionPoints.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
  }

  // Current operational point on Friction Curve
  const currentRad = (inclineAngleDeg * Math.PI) / 180;
  let currentFriction = 0;
  if (inclineAngleDeg <= angleOfReposeDeg) {
    currentFriction = mass1 * gravity * Math.sin(currentRad);
  } else {
    currentFriction = muKinetic * mass1 * gravity * Math.cos(currentRad);
  }
  const curFrictionX = padLeft + (Math.min(90, inclineAngleDeg) / 90) * plotW;
  const curFrictionY = padTop + plotH - (currentFriction / maxPossibleFriction) * plotH;

  // 2. Plot Acceleration a vs Incline Angle theta (0° to 90°)
  // For theta <= angleOfRepose: a = 0
  // For theta > angleOfRepose: a = g * (sin(theta) - mu_k * cos(theta))
  const accPoints: string[] = [];
  for (let i = 0; i <= numSteps; i++) {
    const deg = (i / numSteps) * 90;
    const rad = (deg * Math.PI) / 180;
    let aVal = 0;
    if (deg > angleOfReposeDeg) {
      aVal = gravity * (Math.sin(rad) - muKinetic * Math.cos(rad));
    }
    const xPos = padLeft + (deg / 90) * plotW;
    const yPos = padTop + plotH - (Math.max(0, aVal) / maxPossibleAcc) * plotH;
    accPoints.push(`${xPos.toFixed(1)},${yPos.toFixed(1)}`);
  }
  const curAccX = padLeft + (Math.min(90, inclineAngleDeg) / 90) * plotW;
  const curAccY = padTop + plotH - (Math.max(0, acceleration) / maxPossibleAcc) * plotH;

  // Repose angle line X coordinate
  const reposeX = padLeft + (angleOfReposeDeg / 90) * plotW;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
      {/* Graph 1: Friction Force f vs Angle θ */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-zinc-400">
          <span>Friction f vs Angle θ</span>
          <span className="text-zinc-200">{currentFriction.toFixed(1)} N</span>
        </div>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
          {/* Axes */}
          <line x1={padLeft} y1={padTop + plotH} x2={svgWidth - padRight} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          {/* Angle of repose vertical dashed line */}
          <line x1={reposeX} y1={padTop} x2={reposeX} y2={padTop + plotH} stroke="#71717a" strokeWidth="1" strokeDasharray="2,2" />
          <text x={reposeX} y={padTop + 8} fill="#71717a" fontSize="8" textAnchor="middle" fontFamily="monospace">
            φ={angleOfReposeDeg.toFixed(0)}°
          </text>

          {/* Friction Curve */}
          <polyline fill="none" stroke="#22c55e" strokeWidth="1.5" points={frictionPoints.join(' ')} />

          {/* Active indicator dot */}
          <circle cx={curFrictionX} cy={curFrictionY} r="3.5" fill="#fafafa" stroke="#22c55e" strokeWidth="1" />

          {/* Axis Labels */}
          <text x={padLeft - 4} y={padTop + 6} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {maxPossibleFriction.toFixed(0)}N
          </text>
          <text x={svgWidth - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            90°
          </text>
          <text x={padLeft} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="start" fontFamily="monospace">
            0°
          </text>
        </svg>
      </div>

      {/* Graph 2: Acceleration a vs Angle θ */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850">
        <div className="flex items-center justify-between text-[11px] mb-1 font-mono text-zinc-400">
          <span>Acceleration a vs Angle θ</span>
          <span className="text-zinc-200">{acceleration.toFixed(2)} m/s²</span>
        </div>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
          <line x1={padLeft} y1={padTop + plotH} x2={svgWidth - padRight} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#3f3f46" strokeWidth="1" />

          <line x1={reposeX} y1={padTop} x2={reposeX} y2={padTop + plotH} stroke="#71717a" strokeWidth="1" strokeDasharray="2,2" />

          {/* Acceleration Curve */}
          <polyline fill="none" stroke="#f59e0b" strokeWidth="1.5" points={accPoints.join(' ')} />

          <circle cx={curAccX} cy={curAccY} r="3.5" fill="#fafafa" stroke="#f59e0b" strokeWidth="1" />

          <text x={padLeft - 4} y={padTop + 6} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            {gravity.toFixed(0)}
          </text>
          <text x={svgWidth - padRight} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="end" fontFamily="monospace">
            90°
          </text>
          <text x={padLeft} y={padTop + plotH + 12} fill="#71717a" fontSize="9" textAnchor="start" fontFamily="monospace">
            0°
          </text>
        </svg>
      </div>

      {/* Graph 3: Live Velocity Readout & Equilibrium State */}
      <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-850 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>Kinematic State</span>
          <span className="text-zinc-200">t = {currentTime.toFixed(2)}s</span>
        </div>

        <div className="space-y-2 py-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-mono">Velocity (v):</span>
            <span className="text-zinc-100 font-mono font-semibold">{currentVelocity.toFixed(2)} m/s</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-mono">State:</span>
            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
              acceleration > 0
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
            }`}>
              {acceleration > 0 ? 'Dynamic Slipping' : 'Static Rest'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-mono">Angle of Repose:</span>
            <span className="text-zinc-300 font-mono">{angleOfReposeDeg.toFixed(1)}°</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 text-center border-t border-zinc-850 pt-1">
          {inclineAngleDeg <= angleOfReposeDeg
            ? 'θ ≤ φ: f_s matches mg sinθ exactly'
            : 'θ > φ: static friction broken, a = g(sinθ - μ_k cosθ)'}
        </div>
      </div>
    </div>
  );
};
