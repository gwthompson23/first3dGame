import { COURT } from '@/game/world/court'

export type BallProxy = {
  pos: [number, number, number]
  vel: [number, number, number]
  radius: number
}

type Vec3 = [number, number, number]

export type NetParams = {
  cols: number
  rows: number
  length: number // total vertical length in meters
  attachRadius: number // where it meets rim (outer edge)
  bottomRadius: number // narrowing at bottom
  nodeRadius: number // collision radius for ball vs net nodes
}

export class Net {
  readonly cols: number
  readonly rows: number
  readonly length: number
  readonly nodeRadius: number
  private positions: Float32Array // xyz per node
  private prev: Float32Array
  private anchors: Float32Array // xyz per col at row 0
  private restVert: number
  private restRing: Float32Array // radius per row
  private gravity = 9.81
  private damping = 0.995
  private iterations = 4

  constructor(params?: Partial<NetParams>) {
    const p: NetParams = {
      cols: 16,
      rows: 10,
      length: 0.53,
      attachRadius: 0.235, // match rim outer radius
      bottomRadius: 0.10,
      nodeRadius: 0.02,
      ...params,
    }
    this.cols = p.cols
    this.rows = p.rows
    this.length = p.length
    this.nodeRadius = p.nodeRadius
    this.restVert = p.length / (this.rows - 1)

    const N = this.cols * this.rows
    this.positions = new Float32Array(N * 3)
    this.prev = new Float32Array(N * 3)
    this.anchors = new Float32Array(this.cols * 3)
    this.restRing = new Float32Array(this.rows)

    // Precompute ring radius per row (simple linear taper)
    for (let r = 0; r < this.rows; r++) {
      const t = r / (this.rows - 1)
      this.restRing[r] = mix(p.attachRadius * 0.98, p.bottomRadius, t)
    }
    // Anchors on rim
    const [cx, cy, cz] = COURT.hoopCenter
    for (let c = 0; c < this.cols; c++) {
      const a = (c / this.cols) * Math.PI * 2
      const x = cx + Math.cos(a) * this.restRing[0]
      const z = cz + Math.sin(a) * this.restRing[0]
      const i3 = c * 3
      this.anchors[i3 + 0] = x
      this.anchors[i3 + 1] = cy
      this.anchors[i3 + 2] = z
    }

    // Initialize nodes
    for (let r = 0; r < this.rows; r++) {
      const radius = this.restRing[r]
      const y = cy - r * this.restVert
      for (let c = 0; c < this.cols; c++) {
        const a = (c / this.cols) * Math.PI * 2
        const x = cx + Math.cos(a) * radius
        const z = cz + Math.sin(a) * radius
        const idx = this.index(c, r) * 3
        this.positions[idx + 0] = x
        this.positions[idx + 1] = y
        this.positions[idx + 2] = z
        this.prev[idx + 0] = x
        this.prev[idx + 1] = y
        this.prev[idx + 2] = z
      }
    }
  }

  private index(c: number, r: number) { return r * this.cols + ((c % this.cols) + this.cols) % this.cols }

  getPositions() { return this.positions }

  update(dt: number, ball?: BallProxy) {
    const substeps = 2
    const h = dt / substeps
    for (let s = 0; s < substeps; s++) {
      this.integrate(h)
      for (let it = 0; it < this.iterations; it++) {
        this.satisfyConstraints()
        if (ball) this.ballCollide(ball)
        this.enforceAnchors()
      }
      // simple damping on velocities
      this.applyDamping()
    }
  }

  private integrate(h: number) {
    const g = this.gravity
    for (let i = 0; i < this.positions.length; i += 3) {
      const x = this.positions[i]
      const y = this.positions[i + 1]
      const z = this.positions[i + 2]
      const px = this.prev[i]
      const py = this.prev[i + 1]
      const pz = this.prev[i + 2]
      const vx = (x - px)
      const vy = (y - py)
      const vz = (z - pz)
      // Verlet: x_new = x + v + a*h^2
      this.prev[i] = x
      this.prev[i + 1] = y
      this.prev[i + 2] = z
      this.positions[i] = x + vx
      this.positions[i + 1] = y + vy - g * h * h
      this.positions[i + 2] = z + vz
    }
  }

  private satisfyConstraints() {
    // vertical constraints
    for (let r = 0; r < this.rows - 1; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.enforceDistance(this.index(c, r), this.index(c, r + 1), this.restVert)
      }
    }
    // ring constraints per row (to maintain radius and keep diamond shape)
    for (let r = 0; r < this.rows; r++) {
      const rad = this.restRing[r]
      for (let c = 0; c < this.cols; c++) {
        // neighbor around ring
        this.enforceDistance(this.index(c, r), this.index(c + 1, r), 2 * rad * Math.sin(Math.PI / this.cols))
        // diagonals for diamond lattice
        if (r < this.rows - 1) {
          this.enforceDistance(this.index(c, r), this.index(c + 1, r + 1),
            Math.sqrt(this.restVert * this.restVert + (2 * this.restRingAvg(r, r + 1) * Math.sin(Math.PI / this.cols)) ** 2))
        }
      }
    }
  }

  private restRingAvg(r0: number, r1: number) { return (this.restRing[r0] + this.restRing[r1]) * 0.5 }

  private enforceDistance(i0: number, i1: number, rest: number) {
    const p = this.positions
    const i0_3 = i0 * 3
    const i1_3 = i1 * 3
    const x0 = p[i0_3], y0 = p[i0_3 + 1], z0 = p[i0_3 + 2]
    const x1 = p[i1_3], y1 = p[i1_3 + 1], z1 = p[i1_3 + 2]
    let dx = x1 - x0
    let dy = y1 - y0
    let dz = z1 - z0
    const d = Math.hypot(dx, dy, dz) || 1
    const diff = (d - rest) / d
    // move both points half way
    const ox = dx * 0.5 * diff
    const oy = dy * 0.5 * diff
    const oz = dz * 0.5 * diff
    // top row anchored later; treat uniformly here
    p[i0_3] += ox
    p[i0_3 + 1] += oy
    p[i0_3 + 2] += oz
    p[i1_3] -= ox
    p[i1_3 + 1] -= oy
    p[i1_3 + 2] -= oz
  }

  private enforceAnchors() {
    // Row 0 fixed to rim anchors
    for (let c = 0; c < this.cols; c++) {
      const i = this.index(c, 0) * 3
      const a = c * 3
      this.positions[i + 0] = this.anchors[a + 0]
      this.positions[i + 1] = this.anchors[a + 1]
      this.positions[i + 2] = this.anchors[a + 2]
      this.prev[i + 0] = this.anchors[a + 0]
      this.prev[i + 1] = this.anchors[a + 1]
      this.prev[i + 2] = this.anchors[a + 2]
    }
  }

  private applyDamping() {
    for (let i = 0; i < this.positions.length; i += 3) {
      const vx = this.positions[i] - this.prev[i]
      const vy = this.positions[i + 1] - this.prev[i + 1]
      const vz = this.positions[i + 2] - this.prev[i + 2]
      this.prev[i] = this.positions[i] - vx * this.damping
      this.prev[i + 1] = this.positions[i + 1] - vy * this.damping
      this.prev[i + 2] = this.positions[i + 2] - vz * this.damping
    }
  }

  private ballCollide(ball: BallProxy) {
    const br = ball.radius
    const p = this.positions
    const rNode = this.nodeRadius
    const collideRadius = br + rNode
    const cr2 = collideRadius * collideRadius
    const strength = 0.35 // how much net pushes ball back
    for (let i = 0; i < p.length; i += 3) {
      const dx = ball.pos[0] - p[i]
      const dy = ball.pos[1] - p[i + 1]
      const dz = ball.pos[2] - p[i + 2]
      const d2 = dx*dx + dy*dy + dz*dz
      if (d2 < cr2) {
        const d = Math.sqrt(d2) || 1
        const nfx = dx / d
        const nfy = dy / d
        const nfz = dz / d
        const penetration = collideRadius - d
        // push node back slightly
        p[i] -= nfx * penetration * 0.5
        p[i + 1] -= nfy * penetration * 0.5
        p[i + 2] -= nfz * penetration * 0.5
        // reflect ball velocity and move out along normal
        ball.pos[0] += nfx * penetration * 0.6
        ball.pos[1] += nfy * penetration * 0.6
        ball.pos[2] += nfz * penetration * 0.6
        const vdotn = ball.vel[0]*nfx + ball.vel[1]*nfy + ball.vel[2]*nfz
        if (vdotn < 0) {
          ball.vel[0] -= (1.0 + strength) * vdotn * nfx
          ball.vel[1] -= (1.0 + strength) * vdotn * nfy
          ball.vel[2] -= (1.0 + strength) * vdotn * nfz
          // light tangential damping
          ball.vel[0] *= 0.98
          ball.vel[1] *= 0.98
          ball.vel[2] *= 0.98
        }
      }
    }
  }
}

function mix(a: number, b: number, t: number) { return a + (b - a) * t }

