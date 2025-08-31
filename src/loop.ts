type LoopCallbacks = {
  fixedHz: number
  update: (dt: number) => void
  render: (alpha: number) => void
}

export class Loop {
  private rafId = 0
  private accumulator = 0
  private last = 0
  private readonly dt: number
  private running = false

  constructor(private cb: LoopCallbacks) {
    this.dt = 1 / cb.fixedHz
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = performance.now() / 1000
    const tick = () => {
      if (!this.running) return
      const now = performance.now() / 1000
      let frame = Math.min(0.25, now - this.last)
      this.last = now
      this.accumulator += frame
      while (this.accumulator >= this.dt) {
        this.cb.update(this.dt)
        this.accumulator -= this.dt
      }
      const alpha = this.accumulator / this.dt
      this.cb.render(alpha)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  stop() {
    if (!this.running) return
    this.running = false
    cancelAnimationFrame(this.rafId)
  }
}

