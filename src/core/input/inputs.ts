export class Inputs {
  private keys = new Set<string>()
  private mouseDX = 0
  private mouseDY = 0
  private locked = false
  private buttons = new Set<number>()
  private prevButtons = new Set<number>()

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

    window.addEventListener('mousedown', (e) => {
      this.buttons.add(e.button)
    })
    window.addEventListener('mouseup', (e) => {
      this.buttons.delete(e.button)
    })
  }

  update() {
    // reserved for future per-frame work
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

  // Mouse buttons
  isMouseDown(button: number) { // 0=left,1=middle,2=right
    return this.buttons.has(button)
  }
  wasMousePressed(button: number) {
    // pressed this frame: in buttons and wasn't in prevButtons
    return this.buttons.has(button) && !this.prevButtons.has(button)
  }
  wasMouseReleased(button: number) {
    return !this.buttons.has(button) && this.prevButtons.has(button)
  }

  endFrame() {
    // Take snapshot for next-frame edge detection
    this.prevButtons = new Set(this.buttons)
  }
}
