/**
 * 2D Vector mathematics engine for Physics Imagined.
 * Designed for high performance simulation, vector resolution, and collision calculations.
 */
export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static fromAngle(radians: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude);
  }

  static fromDegrees(degrees: number, magnitude: number = 1): Vector2D {
    const rad = (degrees * Math.PI) / 180;
    return Vector2D.fromAngle(rad, magnitude);
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector2D): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  addMut(v: Vector2D): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  subMut(v: Vector2D): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(factor: number): Vector2D {
    return new Vector2D(this.x * factor, this.y * factor);
  }

  scaleMut(factor: number): this {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * 2D Cross Product (scalar value representing the z-component of 3D cross product):
   * ax * by - ay * bx
   * Positive means counter-clockwise rotation from this to v.
   */
  cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  magSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  mag(): number {
    return Math.sqrt(this.magSq());
  }

  normalize(): Vector2D {
    const m = this.mag();
    if (m === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / m, this.y / m);
  }

  normalizeMut(): this {
    const m = this.mag();
    if (m > 0) {
      this.x /= m;
      this.y /= m;
    }
    return this;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleDeg(): number {
    let deg = (this.angle() * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  }

  rotate(radians: number): Vector2D {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return new Vector2D(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  rotateDeg(degrees: number): Vector2D {
    return this.rotate((degrees * Math.PI) / 180);
  }

  dist(v: Vector2D): number {
    return Math.sqrt(this.distSq(v));
  }

  distSq(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  /**
   * Projects this vector onto target vector.
   * proj = ((this . target) / |target|^2) * target
   */
  projectOn(target: Vector2D): Vector2D {
    const targetMagSq = target.magSq();
    if (targetMagSq === 0) return new Vector2D(0, 0);
    const scalar = this.dot(target) / targetMagSq;
    return target.scale(scalar);
  }

  lerp(v: Vector2D, t: number): Vector2D {
    return new Vector2D(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
  }
}
