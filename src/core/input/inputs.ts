export class Inputs {
  private keys = new Set<string>()
  private mouseDX = 0
  private mouseDY = 0
  private locked = false

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => this.keys.add(e.code))
    window.addEventListener('keyup', (e) => this.keys.delete(e.code))
    window.addEventListener('blur', () => this.keys.clear())

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.mouseDX += e.movementX
        this.mouseDY += e.movementY
      }
    })
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.canvas
      this.mouseDX = 0
      this.mouseDY = 0
    })
  }

  update() {
    // Future: edge detection, bindings
  }

  isDown(code: string) {
    return this.keys.has(code)
  }

  consumeMouseDelta() {
    const dx = this.mouseDX
    const dy = this.mouseDY
    this.mouseDX = 0
    this.mouseDY = 0
    return { dx, dy }
  }

  isLocked() {
    return this.locked
  }
}

