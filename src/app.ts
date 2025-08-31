import { Loop } from './loop'
import { Inputs } from './core/input/inputs'
import { Camera } from './game/camera'
import { Renderer } from './core/renderer/renderer'
import { Player } from './game/player'
import { WORLD_BOXES } from './game/world/world'

export class App {
  private gl: WebGL2RenderingContext | WebGLRenderingContext
  private loop: Loop
  private inputs: Inputs
  private width = 0
  private height = 0
  private camera: Camera
  private renderer: Renderer
  private player: Player

  constructor(private canvas: HTMLCanvasElement) {
    const gl2 = canvas.getContext('webgl2', { antialias: true })
    const gl = gl2 ?? canvas.getContext('webgl', { antialias: true })
    if (!gl) throw new Error('WebGL not supported')
    this.gl = gl
    this.inputs = new Inputs(canvas)
    this.loop = new Loop({
      fixedHz: 60,
      update: (dt) => this.update(dt),
      render: (alpha) => this.render(alpha),
    })
    this.handleResize()
    this.camera = new Camera(this.width / this.height)
    this.renderer = new Renderer(this.gl)
    this.player = new Player()
    window.addEventListener('resize', () => this.handleResize())
    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock()
      }
    })
    document.addEventListener('pointerlockchange', () => {
      document.body.classList.toggle('locked', document.pointerLockElement === canvas)
    })
  }

  start() {
    this.loop.start()
  }

  private handleResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.floor(window.innerWidth * dpr)
    const h = Math.floor(window.innerHeight * dpr)
    if (w !== this.width || h !== this.height) {
      this.width = w
      this.height = h
      this.canvas.width = w
      this.canvas.height = h
      this.canvas.style.width = `${Math.floor(w / dpr)}px`
      this.canvas.style.height = `${Math.floor(h / dpr)}px`
      this.gl.viewport(0, 0, w, h)
      if (this.camera) {
        this.camera.setAspect(w / h)
      }
    }
  }

  private update(dt: number) {
    this.inputs.update()
    if (this.inputs.isLocked()) {
      const { dx, dy } = this.inputs.consumeMouseDelta()
      const sensitivity = 0.0025 // radians per pixel
      if (dx !== 0 || dy !== 0) {
        this.camera.addYawPitch(dx * sensitivity, -dy * sensitivity)
      }
    }
    // Player movement and gravity
    this.player.update(dt, this.inputs, this.camera.yaw, WORLD_BOXES)
    // Sync camera to player's eye position
    this.camera.position[0] = this.player.pos[0]
    this.camera.position[1] = this.player.pos[1] + this.player.eyeHeight
    this.camera.position[2] = this.player.pos[2]
    // refresh view after moving
    this.camera.sync()
  }

  private render(_alpha: number) {
    const gl = this.gl
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.05, 0.07, 0.1, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.renderer.render(this.camera.getViewProj())
  }
}
