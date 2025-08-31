export type Vec3 = [number, number, number]

type Particle = {
  p: Vec3
  v: Vec3
  c: [number, number, number]
  t: number
  ttl: number
}

export class ConfettiSystem {
  private particles: Particle[] = []
  private gravity = 9.81

  spawnBurst(center: Vec3, count = 100) {
    for (let i = 0; i < count; i++) {
      const dir = randomUnitHemisphere([0, 1, 0])
      const speed = 2 + Math.random() * 4
      // small outward horizontal bias
      dir[1] *= 0.6
      const v: Vec3 = [dir[0] * speed, dir[1] * speed + 2, dir[2] * speed]
      const col = randomConfettiColor()
      const ttl = 1.2 + Math.random() * 0.8
      this.particles.push({ p: [...center] as Vec3, v, c: col, t: 0, ttl })
    }
  }

  update(dt: number) {
    const drag = 0.995
    const out: Particle[] = []
    for (let i = 0; i < this.particles.length; i++) {
      const pa = this.particles[i]
      pa.v[1] -= this.gravity * dt * 0.6
      pa.v[0] *= drag
      pa.v[1] *= drag
      pa.v[2] *= drag
      pa.p[0] += pa.v[0] * dt
      pa.p[1] += pa.v[1] * dt
      pa.p[2] += pa.v[2] * dt
      pa.t += dt
      if (pa.t < pa.ttl) out.push(pa)
    }
    this.particles = out
  }

  // Build lines data: two vertices per particle (tail behind velocity)
  buildLineVertices(): Float32Array {
    const seg = this.particles.length
    if (seg === 0) return new Float32Array(0)
    const data = new Float32Array(seg * 2 * 6)
    let o = 0
    const tail = 0.03
    for (let i = 0; i < seg; i++) {
      const pa = this.particles[i]
      const x0 = pa.p[0], y0 = pa.p[1], z0 = pa.p[2]
      const x1 = x0 - pa.v[0] * tail
      const y1 = y0 - pa.v[1] * tail
      const z1 = z0 - pa.v[2] * tail
      // head
      data[o++] = x0; data[o++] = y0; data[o++] = z0
      data[o++] = pa.c[0]; data[o++] = pa.c[1]; data[o++] = pa.c[2]
      // tail
      data[o++] = x1; data[o++] = y1; data[o++] = z1
      data[o++] = pa.c[0]; data[o++] = pa.c[1]; data[o++] = pa.c[2]
    }
    return data
  }

  forEach(fn: (pos: Vec3, color: [number, number, number]) => void) {
    for (const p of this.particles) fn(p.p, p.c)
  }
}

function randomUnitHemisphere(up: Vec3): Vec3 {
  // Cosine-weighted hemisphere around 'up'
  const u = Math.random()
  const v = Math.random()
  const theta = 2 * Math.PI * u
  const r = Math.sqrt(v)
  const x = r * Math.cos(theta)
  const z = r * Math.sin(theta)
  const y = Math.sqrt(Math.max(0, 1 - r*r))
  // align y to up=[0,1,0] for now
  return [x, y, z]
}

function randomConfettiColor(): [number, number, number] {
  const palette: [number, number, number][] = [
    [0.95, 0.30, 0.30], // red
    [0.25, 0.65, 0.95], // blue
    [0.25, 0.85, 0.45], // green
    [0.98, 0.85, 0.25], // yellow
    [0.85, 0.40, 0.95], // purple
    [0.98, 0.55, 0.15], // orange
  ]
  return palette[(Math.random() * palette.length) | 0]
}
