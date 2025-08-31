import { Loop } from './loop'
import { Inputs } from './core/input/inputs'
import { Camera } from './game/camera'
import { Renderer } from './core/renderer/renderer'
import { Player } from './game/player'
import { WORLD_BOXES } from './game/world/world'
import { Net } from './game/world/net'
import { Ball } from '@/game/ball/ball'
import { COURT } from '@/game/world/court'
import { ConfettiSystem } from '@/game/effects/confetti'

export class App {
  private gl: WebGL2RenderingContext | WebGLRenderingContext
  private loop: Loop
  private inputs: Inputs
  private width = 0
  private height = 0
  private camera: Camera
  private renderer: Renderer
  private player: Player
  private net: Net
  private ball: Ball
  private showArc = false
  private aimStart: [number, number, number] | null = null
  private aimVel: [number, number, number] | null = null
  private confetti = new ConfettiSystem()
  private lastBallY = 0
  private lastBallTopY = 0
  private scoreCooldown = 0
  private enteredCylinderFromAbove = false

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
    this.net = new Net()
    this.ball = new Ball({ pos: [COURT.center[0] + 1.5, COURT.y + 0.15, COURT.center[2] - 3] })
    window.addEventListener('resize', () => this.handleResize())
    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock()
      }
    })
    document.addEventListener('pointerlockchange', () => {
      document.body.classList.toggle('locked', document.pointerLockElement === canvas)
    })
    // Ensure HUD handle is bound
    this.scoreEl = document.getElementById('score')
    if (this.scoreEl) this.scoreEl.textContent = String(this.score)
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
    // Update net (no ball yet)
    // Ball pickup/hold/throw
    this.updateBall(dt)
    // Update net with ball proxy when ball is free
    if (!this.ball.inHand) this.net.update(dt, this.ball)
    else this.net.update(dt)

    // Confetti update
    this.confetti.update(dt)

    // Score detection and confetti spawn
    this.detectScore(dt)

    // End-of-frame input edge snapshot
    this.inputs.endFrame()
  }

  private render(_alpha: number) {
    const gl = this.gl
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.05, 0.07, 0.1, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // Sync net geometry to GPU (thick lines face camera)
    this.renderer.syncNet(this.net, this.camera.position)
    this.renderer.render(
      this.camera.getView(),
      this.camera.getProj(),
      this.camera.position,
      { pos: this.player.pos, radius: this.player.radius, height: this.player.eyeHeight }
    )

    // Render ball (world or in-hand)
    const viewProj = this.camera.getViewProj()
    const orange: [number, number, number] = [0.92, 0.45, 0.1]
    // In-hand: draw slightly to the bottom-right of the view
    if (this.ball.inHand) {
      const held = this.heldBallWorldPos()
      this.renderer.renderBasketball(viewProj, held, this.ball.radius, this.ball.getRotationMatrix3())
      // Trajectory preview
      if (this.showArc && this.aimStart && this.aimVel) {
        const arcPts = this.computeTrajectoryPoints(this.aimStart, this.aimVel)
        this.renderer.renderLineStrip(viewProj, arcPts, [0.2, 0.85, 1.0])
      }
    } else {
      this.renderer.renderBasketball(viewProj, this.ball.pos, this.ball.radius, this.ball.getRotationMatrix3())
    }

    // Render confetti as small spheres for visibility
    this.confetti.forEach((pos, col) => {
      this.renderer.renderSphere(viewProj, pos, 0.03, col)
    })
  }

  private updateBall(dt: number) {
    const b = this.ball
    // Pickup when close
    if (!b.inHand) {
      const dx = (this.player.pos[0]) - b.pos[0]
      const dy = (this.player.pos[1] + this.player.eyeHeight * 0.5) - b.pos[1]
      const dz = (this.player.pos[2]) - b.pos[2]
      const dist = Math.hypot(dx, dy, dz)
      if (dist < 0.8) {
        b.setInHand(true)
      }
    }
    // While held: follow offset near camera
    if (b.inHand) {
      const held = this.heldBallWorldPos()
      b.pos[0] = held[0]; b.pos[1] = held[1]; b.pos[2] = held[2]
      b.vel[0] = 0; b.vel[1] = 0; b.vel[2] = 0
      b.angVel[0] = 0; b.angVel[1] = 0; b.angVel[2] = 0
      // Arc preview toggle
      this.showArc = this.inputs.isMouseDown(0)
      if (this.showArc) {
        this.aimStart = this.heldBallWorldPos()
        this.aimVel = this.throwVelocity()
      }
      // Release to throw
      if (this.inputs.wasMouseReleased(0)) {
        const start = this.aimStart ?? this.heldBallWorldPos()
        const v = this.aimVel ?? this.throwVelocity()
        b.setInHand(false)
        b.pos[0] = start[0]; b.pos[1] = start[1]; b.pos[2] = start[2]
        b.vel[0] = v[0]; b.vel[1] = v[1]; b.vel[2] = v[2]
        // Give the ball some backspin around camera right axis
        const cy = Math.cos(this.camera.yaw), sy = Math.sin(this.camera.yaw)
        const right: [number, number, number] = [cy, 0, sy]
        const spin = 12.0 // rad/s
        b.angVel[0] = right[0] * spin
        b.angVel[1] = right[1] * spin
        b.angVel[2] = right[2] * spin
        this.showArc = false
        this.aimStart = null
        this.aimVel = null
      }
    } else {
      b.update(dt)
    }
  }

  private heldBallWorldPos(): [number, number, number] {
    // Compute camera basis from yaw/pitch
    const cp = Math.cos(this.camera.pitch)
    const sp = Math.sin(this.camera.pitch)
    const cy = Math.cos(this.camera.yaw)
    const sy = Math.sin(this.camera.yaw)
    const fwd: [number, number, number] = [cp * sy, sp, -cp * cy]
    const right: [number, number, number] = [cy, 0, sy]
    const up: [number, number, number] = [0, 1, 0]
    // Place slightly in front, to the right, and down
    const offF = 0.45
    const offR = 0.28
    const offD = -0.22 // down
    const cx = this.camera.position[0]
    const cy0 = this.camera.position[1]
    const cz = this.camera.position[2]
    return [
      cx + fwd[0]*offF + right[0]*offR + up[0]*offD,
      cy0 + fwd[1]*offF + right[1]*offR + up[1]*offD,
      cz + fwd[2]*offF + right[2]*offR + up[2]*offD,
    ]
  }

  private throwVelocity(): [number, number, number] {
    // Initial speed tuned for halfcourt hoop
    const speed = 9.0
    const cp = Math.cos(this.camera.pitch)
    const sp = Math.sin(this.camera.pitch)
    const cy = Math.cos(this.camera.yaw)
    const sy = Math.sin(this.camera.yaw)
    const dir: [number, number, number] = [cp * sy, sp + 0.05, -cp * cy]
    // normalize
    const len = Math.hypot(dir[0], dir[1], dir[2]) || 1
    dir[0] /= len; dir[1] /= len; dir[2] /= len
    return [dir[0]*speed, dir[1]*speed, dir[2]*speed]
  }

  private computeTrajectoryPoints(start: [number, number, number], vel: [number, number, number]) {
    const g = 9.81
    const pts: number[] = []
    const steps = 40
    const dt = 0.05
    for (let i = 0; i < steps; i++) {
      const t = i * dt
      const x = start[0] + vel[0] * t
      const y = start[1] + vel[1] * t - 0.5 * g * t * t
      const z = start[2] + vel[2] * t
      pts.push(x, y, z)
    }
    return pts
  }

  private detectScore(dt: number) {
    if (this.scoreCooldown > 0) this.scoreCooldown -= dt
    if (this.ball.inHand) { this.lastBallY = this.ball.pos[1]; this.enteredCylinderFromAbove = false; return }
    const cx = COURT.hoopCenter[0]
    const cz = COURT.hoopCenter[2]
    const rimY = COURT.hoopCenter[1]
    const b = this.ball
    const dx = b.pos[0] - cx
    const dz = b.pos[2] - cz
    const dist = Math.hypot(dx, dz)
    const innerR = 0.205
    const margin = b.radius * 0.35
    const insideXY = dist < (innerR - margin)
    const topY = b.pos[1] + b.radius
    const bottomY = b.pos[1] - b.radius
    const entrySlack = 0.01
    const exitSlackTop = 0.02

    // Mark as entered when the top of the ball is above rim and it is within the cylinder
    if (insideXY && topY > rimY + entrySlack) {
      this.enteredCylinderFromAbove = true
    }

    // Score when we've previously entered from above and the ENTIRE ball clears below rim plane
    if (this.enteredCylinderFromAbove && topY < rimY - exitSlackTop && this.scoreCooldown <= 0) {
      this.confetti.spawnBurst([cx, rimY - 0.05, cz], 160)
      this.scoreCooldown = 0.75
      this.incrementScore(1)
      this.enteredCylinderFromAbove = false
    }

    // Reset the enter state if the ball moves out of the cylinder significantly or goes back well above
    if (!insideXY || topY < rimY - 0.05 || topY > rimY + 0.5) {
      // Allow re-arm next time it comes in from above
      if (bottomY < rimY - 0.05) this.enteredCylinderFromAbove = false
    }

    this.lastBallY = b.pos[1]
    this.lastBallTopY = topY
  }

  // --- Score HUD ---
  private score = 0
  private scoreEl: HTMLElement | null = document.getElementById('score')
  private incrementScore(amount: number) {
    this.score += amount
    if (this.scoreEl) this.scoreEl.textContent = String(this.score)
  }
}
