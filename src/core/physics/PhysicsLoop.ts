export interface PhysicsLoopCallbacks {
  update: (dt: number, totalTime: number) => void;
  render: () => void;
}

export class PhysicsLoop {
  private isRunning: boolean = false;
  private timeScale: number = 1.0;
  private totalTime: number = 0;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private fixedDeltaTime: number = 1 / 60; // 60 updates/sec standard
  private callbacks: PhysicsLoopCallbacks;

  constructor(callbacks: PhysicsLoopCallbacks) {
    this.callbacks = callbacks;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.loop = this.loop.bind(this);
    this.animFrameId = requestAnimationFrame(this.loop);
  }

  pause() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.totalTime = 0;
    this.callbacks.render();
  }

  step(dtSeconds: number = 1 / 60) {
    this.totalTime += dtSeconds;
    this.callbacks.update(dtSeconds, this.totalTime);
    this.callbacks.render();
  }

  setTimeScale(scale: number) {
    this.timeScale = Math.max(0.01, Math.min(10, scale));
  }

  getTimeScale(): number {
    return this.timeScale;
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  getTotalTime(): number {
    return this.totalTime;
  }

  setTotalTime(t: number) {
    this.totalTime = t;
  }

  private loop(now: number) {
    if (!this.isRunning) return;

    let elapsed = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    // Guard against massive delta when tab loses focus
    if (elapsed > 0.1) elapsed = 0.1;

    // Apply time scaling (slow motion / fast forward)
    const effectiveDt = elapsed * this.timeScale;

    // Fixed timestep accumulation for stability
    const subSteps = Math.min(8, Math.max(1, Math.ceil(effectiveDt / this.fixedDeltaTime)));
    const stepDt = effectiveDt / subSteps;

    for (let i = 0; i < subSteps; i++) {
      this.totalTime += stepDt;
      this.callbacks.update(stepDt, this.totalTime);
    }

    this.callbacks.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.pause();
  }
}
