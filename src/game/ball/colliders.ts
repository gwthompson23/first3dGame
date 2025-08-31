import { COURT } from '@/game/world/court'
import type { BallProxy } from '@/game/world/net'

// Backboard front plane collider for a sphere ball
export function collideBallWithBackboard(ball: BallProxy, restitution = 0.3) {
  const boardT = 0.05
  const planeZ = COURT.backboardZ + boardT / 2
  const slop = 0.03 // be a bit more forgiving (3cm)
  // Front face points toward +Z (into the court).
  // Trigger slightly early with slop so near misses still bounce.
  if (ball.pos[2] - ball.radius < planeZ + slop) {
    const target = planeZ + slop + ball.radius
    const pen = target - ball.pos[2]
    if (pen > 0) {
      ball.pos[2] += pen
      // Reflect if moving into the board (low bounce)
      if (ball.vel[2] < 0) ball.vel[2] = -ball.vel[2] * restitution
      // stronger friction parallel to plane (quickly kills lateral)
      ball.vel[0] *= 0.75
      ball.vel[1] *= 0.75
    }
  }
}

// Rim as a ring of small spheres
export function collideBallWithRim(ball: BallProxy, restitution = 0.2) {
  // Larger rim: inner ~0.205, outer ~0.255 => mid ~0.23
  const ringR = 0.23
  const tubeR = 0.012
  const seg = 24
  const cx = COURT.hoopCenter[0]
  const cy = COURT.hoopCenter[1]
  const cz = COURT.hoopCenter[2]
  const cr = ball.radius + tubeR
  const cr2 = cr * cr
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2
    const sx = cx + Math.cos(a) * ringR
    const sz = cz + Math.sin(a) * ringR
    const dx = ball.pos[0] - sx
    const dy = ball.pos[1] - cy
    const dz = ball.pos[2] - sz
    const d2 = dx*dx + dy*dy + dz*dz
    if (d2 < cr2) {
      const d = Math.sqrt(d2) || 1
      const nx = dx / d, ny = dy / d, nz = dz / d
      const pen = cr - d
      ball.pos[0] += nx * pen
      ball.pos[1] += ny * pen
      ball.pos[2] += nz * pen
      const vdotn = ball.vel[0]*nx + ball.vel[1]*ny + ball.vel[2]*nz
      if (vdotn < 0) {
        ball.vel[0] -= (1.0 + restitution) * vdotn * nx
        ball.vel[1] -= (1.0 + restitution) * vdotn * ny
        ball.vel[2] -= (1.0 + restitution) * vdotn * nz
        // tangential damping to reduce jitter
        ball.vel[0] *= 0.98
        ball.vel[1] *= 0.98
        ball.vel[2] *= 0.98
      }
      break
    }
  }
}
