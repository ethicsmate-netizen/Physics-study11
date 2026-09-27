import { Vector2D } from '../math/Vector2D';

export interface ViewportConfig {
  pixelsPerMeter: number;
  originX: number; // in screen pixels from left
  originY: number; // in screen pixels from top
  minZoom?: number;
  maxZoom?: number;
}

export class CoordinateSystem {
  public pixelsPerMeter: number;
  public originX: number;
  public originY: number;
  public minZoom: number;
  public maxZoom: number;

  constructor(config: Partial<ViewportConfig> = {}) {
    this.pixelsPerMeter = config.pixelsPerMeter ?? 25; // 25 px = 1 meter default
    this.originX = config.originX ?? 100;
    this.originY = config.originY ?? 500;
    this.minZoom = config.minZoom ?? 5;
    this.maxZoom = config.maxZoom ?? 200;
  }

  /**
   * Converts world coordinates (meters, Cartesian where +y is UP) to Canvas screen coordinates (+y is DOWN).
   */
  worldToScreen(world: Vector2D): Vector2D {
    const sx = this.originX + world.x * this.pixelsPerMeter;
    const sy = this.originY - world.y * this.pixelsPerMeter;
    return new Vector2D(sx, sy);
  }

  /**
   * Converts Canvas screen pixels to world coordinates (meters, Cartesian where +y is UP).
   */
  screenToWorld(screen: Vector2D): Vector2D {
    const wx = (screen.x - this.originX) / this.pixelsPerMeter;
    const wy = (this.originY - screen.y) / this.pixelsPerMeter;
    return new Vector2D(wx, wy);
  }

  worldToScreenLength(meters: number): number {
    return meters * this.pixelsPerMeter;
  }

  screenToWorldLength(pixels: number): number {
    return pixels / this.pixelsPerMeter;
  }

  zoom(factor: number, centerScreenX?: number, centerScreenY?: number) {
    const newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.pixelsPerMeter * factor));
    if (centerScreenX !== undefined && centerScreenY !== undefined) {
      // Zoom towards center point
      const worldCenter = this.screenToWorld(new Vector2D(centerScreenX, centerScreenY));
      this.pixelsPerMeter = newZoom;
      this.originX = centerScreenX - worldCenter.x * this.pixelsPerMeter;
      this.originY = centerScreenY + worldCenter.y * this.pixelsPerMeter;
    } else {
      this.pixelsPerMeter = newZoom;
    }
  }

  pan(deltaPixelsX: number, deltaPixelsY: number) {
    this.originX += deltaPixelsX;
    this.originY += deltaPixelsY;
  }

  setOrigin(x: number, y: number) {
    this.originX = x;
    this.originY = y;
  }

  /**
   * Draws a scientific coordinate grid with adaptive markings based on zoom level.
   */
  drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    options: {
      showLabels?: boolean;
      gridColor?: string;
      axisColor?: string;
      labelColor?: string;
    } = {}
  ) {
    const showLabels = options.showLabels ?? true;
    const gridColor = options.gridColor ?? 'rgba(255, 255, 255, 0.05)';
    const axisColor = options.axisColor ?? 'rgba(148, 163, 184, 0.4)';
    const labelColor = options.labelColor ?? '#64748b';

    // Calculate nice step in meters based on zoom level
    let stepMeters = 1;
    if (this.pixelsPerMeter < 10) stepMeters = 10;
    else if (this.pixelsPerMeter < 20) stepMeters = 5;
    else if (this.pixelsPerMeter < 40) stepMeters = 2;
    else if (this.pixelsPerMeter < 90) stepMeters = 1;
    else stepMeters = 0.5;

    const stepPixels = stepMeters * this.pixelsPerMeter;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;

    // Vertical grid lines
    const startX = this.originX % stepPixels;
    for (let x = startX; x < width; x += stepPixels) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      if (showLabels) {
        const worldX = (x - this.originX) / this.pixelsPerMeter;
        if (Math.abs(worldX) > 0.001) {
          ctx.fillStyle = labelColor;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${worldX.toFixed(stepMeters < 1 ? 1 : 0)}m`, x, Math.min(height - 6, Math.max(16, this.originY + 14)));
        }
      }
    }

    // Horizontal grid lines
    const startY = this.originY % stepPixels;
    for (let y = startY; y < height; y += stepPixels) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      if (showLabels) {
        const worldY = (this.originY - y) / this.pixelsPerMeter;
        if (Math.abs(worldY) > 0.001) {
          ctx.fillStyle = labelColor;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${worldY.toFixed(stepMeters < 1 ? 1 : 0)}m`, Math.max(28, Math.min(width - 6, this.originX - 6)), y + 4);
        }
      }
    }

    // Draw main X and Y Axes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = axisColor;

    // X Axis
    if (this.originY >= 0 && this.originY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, this.originY);
      ctx.lineTo(width, this.originY);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('+X (m)', width - 12, this.originY - 8);
    }

    // Y Axis
    if (this.originX >= 0 && this.originX <= width) {
      ctx.beginPath();
      ctx.moveTo(this.originX, 0);
      ctx.lineTo(this.originX, height);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('+Y (m)', this.originX + 8, 16);
    }

    // Origin indicator (0,0)
    if (this.originX >= 0 && this.originX <= width && this.originY >= 0 && this.originY <= height) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(this.originX, this.originY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('O (0,0)', this.originX - 8, this.originY + 14);
    }

    ctx.restore();
  }
}
