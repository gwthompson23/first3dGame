import { COURT } from '@/game/world/court'
import type { BallProxy } from '@/game/world/net'

// Backboard front plane collider for a sphere ball
export function collideBallWithBackboard(ball: BallProxy, restitution = 0.6) {
  const boardT = 0.05
  const planeZ = COURT.backboardZ + boardT / 2
  // If sphere center penetrates plane, push out and reflect z velocity (plane normal toward -Z)
  if (ball.pos[2] + ball.radius > planeZ) {
    const pen = ball.pos[2] + ball.radius - planeZ
    ball.pos[2] -= pen
    if (ball.vel[2] > 0) ball.vel[2] = -ball.vel[2] * restitution
    // friction parallel to plane
    ball.vel[0] *= 0.9
    ball.vel[1] *= 0.9
  }
}

// Rim as a ring of small spheres
export function collideBallWithRim(ball: BallProxy, restitution = 0.5) {
  const ringR = 0.2125 // mid-thickness radius between inner/outer
  const tubeR = 0.02
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

