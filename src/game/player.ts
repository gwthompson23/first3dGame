import { Vec3 } from '@/core/math/math'
import { resolveCapsuleVsAABB, AABB } from './world/collision'
import { Inputs } from '@/core/input/inputs'

export class Player {
  pos: Vec3 = [0, 0, 5] // feet position
  vel: Vec3 = [0, 0, 0]
  eyeHeight = 1.6
  grounded = false
  radius = 0.35

  // Tuning
  moveSpeed = 6 // m/s
  accel = 40 // m/s^2
  friction = 10 // 1/s
  jumpSpeed = 5 // m/s
  gravity = 9.81 // m/s^2

  update(dt: number, inputs: Inputs, yaw: number, boxes: AABB[]) {
    // horizontal basis from yaw (ignore pitch)
    const sinY = Math.sin(yaw)
    const cosY = Math.cos(yaw)
    const fwdX = sinY
    const fwdZ = -cosY
    const rightX = cosY
    const rightZ = sinY

    let wishX = 0
    let wishZ = 0
    if (inputs.isDown('KeyW') || inputs.isDown('ArrowUp')) { wishX += fwdX; wishZ += fwdZ }
    if (inputs.isDown('KeyS') || inputs.isDown('ArrowDown')) { wishX -= fwdX; wishZ -= fwdZ }
    if (inputs.isDown('KeyD') || inputs.isDown('ArrowRight')) { wishX += rightX; wishZ += rightZ }
    if (inputs.isDown('KeyA') || inputs.isDown('ArrowLeft')) { wishX -= rightX; wishZ -= rightZ }

    // normalize wish direction
    const wishLen = Math.hypot(wishX, wishZ)
    if (wishLen > 0) { wishX /= wishLen; wishZ /= wishLen }

    // accelerate towards desired horizontal velocity
    const targetVX = wishX * this.moveSpeed
    const targetVZ = wishZ * this.moveSpeed
    const ax = targetVX - this.vel[0]
    const az = targetVZ - this.vel[2]
    const maxAccel = this.accel * dt
    const axLen = Math.hypot(ax, az)
    if (axLen > 0) {
      const scale = Math.min(1, maxAccel / axLen)
      this.vel[0] += ax * scale
      this.vel[2] += az * scale
    }

    // ground friction when no input and grounded
    if (this.grounded && wishLen === 0) {
      const speed = Math.hypot(this.vel[0], this.vel[2])
      const drop = Math.min(speed, this.friction * dt * speed)
      if (speed > 1e-5) {
        const newSpeed = speed - drop
        const s = newSpeed / speed
        this.vel[0] *= s
        this.vel[2] *= s
      } else {
        this.vel[0] = 0
        this.vel[2] = 0
      }
    }

    // jump
    if (this.grounded && inputs.isDown('Space')) {
      this.vel[1] = this.jumpSpeed
      this.grounded = false
    }

    // gravity
    if (!this.grounded) {
      this.vel[1] -= this.gravity * dt
    }

    // integrate
    this.pos[0] += this.vel[0] * dt
    this.pos[1] += this.vel[1] * dt
    this.pos[2] += this.vel[2] * dt

    // collide with ground plane at y=0 (feet)
    if (this.pos[1] < 0) {
      this.pos[1] = 0
      if (this.vel[1] < 0) this.vel[1] = 0
      this.grounded = true
    } else {
      this.grounded = false
    }

    // collide with world boxes using capsule vs AABB
    for (const box of boxes) {
      const hit = resolveCapsuleVsAABB(this.pos, this.radius, this.eyeHeight, box)
      if (hit) {
        const [cx, cy, cz] = hit.correction
        this.pos[0] += cx
        this.pos[1] += cy
        this.pos[2] += cz
        // remove velocity into the collision normal (basic slide)
        const vn = this.vel[0]*hit.normal[0] + this.vel[1]*hit.normal[1] + this.vel[2]*hit.normal[2]
        if (vn < 0) {
          this.vel[0] -= hit.normal[0] * vn
          this.vel[1] -= hit.normal[1] * vn
          this.vel[2] -= hit.normal[2] * vn
        }
        // consider grounded when normal has significant upward component
        if (hit.normal[1] > 0.5) {
          this.grounded = true
        }
      }
    }
  }
}
