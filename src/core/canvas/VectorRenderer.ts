import { Vector2D } from '../math/Vector2D';

export interface VectorDrawOptions {
  color: string;
  lineWidth?: number;
  label?: string;
  subLabel?: string;
  showComponents?: boolean;
  componentColor?: string;
  headSize?: number;
  dashed?: boolean;
}

export class VectorRenderer {
  /**
   * Draws a vector arrow on the canvas from start point with a given vector displacement.
   * Both start and vector are in SCREEN pixel coordinates.
   */
  static drawScreenVector(
    ctx: CanvasRenderingContext2D,
    start: Vector2D,
    vec: Vector2D,
    options: VectorDrawOptions
  ) {
    const mag = vec.mag();
    if (mag < 1) return; // Don't draw zero or sub-pixel vectors

    const headSize = Math.min(options.headSize ?? 10, mag * 0.4);
    const end = start.add(vec);
    const angle = vec.angle();

    ctx.save();
    ctx.strokeStyle = options.color;
    ctx.fillStyle = options.color;
    ctx.lineWidth = options.lineWidth ?? 2;

    if (options.dashed) {
      ctx.setLineDash([4, 4]);
    } else {
      ctx.setLineDash([]);
    }

    // Main line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Arrowhead
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headSize * Math.cos(angle - Math.PI / 6),
      end.y - headSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headSize * Math.cos(angle + Math.PI / 6),
      end.y - headSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    // Draw component projections if requested (e.g. vx along x, vy along y)
    if (options.showComponents) {
      const compColor = options.componentColor ?? 'rgba(255, 255, 255, 0.35)';
      ctx.save();
      ctx.strokeStyle = compColor;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // Horizontal component line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, start.y);
      ctx.stroke();

      // Vertical component line
      ctx.beginPath();
      ctx.moveTo(end.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.restore();
    }

    // Draw Label
    if (options.label) {
      ctx.save();
      ctx.font = '500 12px "Inter", sans-serif';
      ctx.fillStyle = options.color;

      // Position label slightly offset from vector endpoint
      const normal = new Vector2D(-Math.sin(angle), Math.cos(angle)).scale(14);
      const labelPos = end.add(normal);

      ctx.fillText(options.label, labelPos.x, labelPos.y);

      if (options.subLabel) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(options.subLabel, labelPos.x, labelPos.y + 12);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws an angle arc with degree text between base angle and vector angle.
   */
  static drawAngleArc(
    ctx: CanvasRenderingContext2D,
    center: Vector2D,
    radius: number,
    startAngleRad: number,
    endAngleRad: number,
    label: string,
    color: string = '#38bdf8'
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, -startAngleRad, -endAngleRad, true);
    ctx.stroke();

    // Mid angle for text
    const midAngle = -(startAngleRad + endAngleRad) / 2;
    const textRadius = radius + 14;
    const tx = center.x + Math.cos(midAngle) * textRadius;
    const ty = center.y + Math.sin(midAngle) * textRadius;

    ctx.fillStyle = color;
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, tx, ty);
    ctx.restore();
  }
}
