import React from 'react';
import { Vector2D } from '../../core/math/Vector2D';
import { VectorRenderer } from '../../core/canvas/VectorRenderer';

export interface ForceVector {
  name: string;
  symbol: string;
  magnitude: number; // in Newtons
  directionAngleDeg: number; // in degrees, Cartesian standard (0 = right, 90 = up, 180 = left, 270 = down)
  color: string;
  isComponent?: boolean;
}

interface FbdInspectorProps {
  title: string;
  bodyLabel: string;
  mass: number;
  forces: ForceVector[];
  equations: string[];
  netAcc?: number;
  accDirection?: string;
  width?: number;
  height?: number;
}

export const FbdInspector: React.FC<FbdInspectorProps> = ({
  title,
  bodyLabel,
  mass,
  forces,
  equations,
  netAcc,
  accDirection,
  width = 240,
  height = 200,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const center = new Vector2D(centerX, centerY);

    // Draw faint crosshair grid
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, 15);
    ctx.lineTo(centerX, height - 15);
    ctx.moveTo(15, centerY);
    ctx.lineTo(width - 15, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw isolated body at center (as defined in Allen Notes: isolated from surroundings)
    const boxSize = 32;
    ctx.fillStyle = '#18181b';
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);
    ctx.strokeRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize);

    // Label on body
    ctx.fillStyle = '#fafafa';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${mass}kg`, centerX, centerY);

    // Draw all forces emerging from the center of mass (~4-5 cm max length)
    const maxForce = Math.max(...forces.map((f) => f.magnitude), 10);
    const maxArrowPx = 42;
    const scale = maxArrowPx / maxForce;

    forces.forEach((force) => {
      if (force.magnitude < 0.1) return;

      const rad = (force.directionAngleDeg * Math.PI) / 180;
      const arrowLength = Math.max(16, force.magnitude * scale);
      // Canvas coordinate system: y is flipped
      const vec = new Vector2D(arrowLength * Math.cos(rad), -arrowLength * Math.sin(rad));

      VectorRenderer.drawScreenVector(ctx, center, vec, {
        color: force.color,
        lineWidth: force.isComponent ? 1.4 : 2.0,
        label: force.symbol,
        subLabel: `${force.magnitude.toFixed(1)}N`,
        dashed: force.isComponent,
        headSize: 5.5,
      });
    });
  }, [forces, mass, width, height]);

  return (
    <div className="rounded-lg bg-zinc-900/90 border border-zinc-800 p-3 flex flex-col justify-between space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          {title} ({bodyLabel})
        </span>
        {netAcc !== undefined && (
          <span className="font-mono text-[10px] text-zinc-300 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
            a = {Math.abs(netAcc).toFixed(2)} m/s² {accDirection}
          </span>
        )}
      </div>

      {/* Isolated FBD Canvas */}
      <div className="flex justify-center bg-zinc-950 rounded border border-zinc-850 overflow-hidden py-1">
        <canvas ref={canvasRef} width={width} height={height} className="block" />
      </div>

      {/* Equations Breakdown */}
      <div className="bg-zinc-950/60 p-2 rounded border border-zinc-850 space-y-1 font-mono text-[11px]">
        <div className="text-[10px] text-zinc-400 font-sans font-medium uppercase tracking-wider mb-1">
          Force Equations Along Axes
        </div>
        {equations.map((eq, i) => (
          <div key={i} className="text-zinc-300 truncate">
            {eq}
          </div>
        ))}
      </div>
    </div>
  );
};
