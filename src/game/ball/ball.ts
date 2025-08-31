import { heightAt } from '@/game/world/terrain'
import type { BallProxy } from '@/game/world/net'
import { collideBallWithBackboard, collideBallWithRim } from '@/game/ball/colliders'

export type Vec3 = [number, number, number]

export class Ball implements BallProxy {
  pos: Vec3
  vel: Vec3
  radius: number
  inHand = false
  // Orientation (3x3) and angular velocity for spin rendering
  rot: Float32Array = new Float32Array([1,0,0, 0,1,0, 0,0,1])
  angVel: Vec3 = [0, 0, 0] // radians/sec in world space

  private gravity = 9.81

  constructor(opts?: Partial<{ pos: Vec3; vel: Vec3; radius: number }>) {
    this.radius = opts?.radius ?? 0.12 // ~24cm diameter (NBA ~24.26cm)
    this.pos = opts?.pos ? [...opts.pos] as Vec3 : [0, 2, 0]
    this.vel = opts?.vel ? [...opts.vel] as Vec3 : [0, 0, 0]
  }

  reset(pos: Vec3) {
    this.pos[0] = pos[0]
    this.pos[1] = pos[1]
    this.pos[2] = pos[2]
    this.vel[0] = 0
    this.vel[1] = 0
    this.vel[2] = 0
    this.inHand = false
    this.rot.set([1,0,0, 0,1,0, 0,0,1])
    this.angVel[0] = this.angVel[1] = this.angVel[2] = 0
  }

  update(dt: number) {
    if (this.inHand) return
    // integrate
    this.vel[1] -= this.gravity * dt
    this.pos[0] += this.vel[0] * dt
    this.pos[1] += this.vel[1] * dt
    this.pos[2] += this.vel[2] * dt

    // integrate orientation from angular velocity
    this.integrateRotation(dt)

    // terrain collide (approx as sphere vs heightfield)
    const groundY = heightAt(this.pos[0], this.pos[2]) + this.radius
    if (this.pos[1] < groundY) {
      const restitution = 0.45
      const friction = 0.8
      this.pos[1] = groundY
      if (this.vel[1] < 0) this.vel[1] = -this.vel[1] * restitution
      this.vel[0] *= friction
      this.vel[2] *= friction
      // sleep small velocities
      if (Math.abs(this.vel[1]) < 0.05) this.vel[1] = 0
      if (Math.hypot(this.vel[0], this.vel[2]) < 0.02) { this.vel[0] = 0; this.vel[2] = 0 }
    }

    // backboard + rim collisions
    collideBallWithBackboard(this)
    collideBallWithRim(this)
  }

  setInHand(value: boolean) {
    this.inHand = value
  }

  private integrateRotation(dt: number) {
    const wx = this.angVel[0], wy = this.angVel[1], wz = this.angVel[2]
    const w = Math.hypot(wx, wy, wz)
    if (w < 1e-4) return
    const ax = wx / w, ay = wy / w, az = wz / w
    const theta = w * dt
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    const t = 1 - c
    // Rodrigues rotation matrix R(axis,theta)
    const R = [
      t*ax*ax + c,     t*ax*ay - s*az, t*ax*az + s*ay,
      t*ax*ay + s*az,  t*ay*ay + c,    t*ay*az - s*ax,
      t*ax*az - s*ay,  t*ay*az + s*ax, t*az*az + c,
    ]
    // this.rot = this.rot * R (post-multiply to rotate local frame)
    const m = this.rot
    const m00 = m[0], m01 = m[1], m02 = m[2]
    const m10 = m[3], m11 = m[4], m12 = m[5]
    const m20 = m[6], m21 = m[7], m22 = m[8]
    const r00 = R[0], r01 = R[1], r02 = R[2]
    const r10 = R[3], r11 = R[4], r12 = R[5]
    const r20 = R[6], r21 = R[7], r22 = R[8]
    this.rot[0] = m00*r00 + m01*r10 + m02*r20
    this.rot[1] = m00*r01 + m01*r11 + m02*r21
    this.rot[2] = m00*r02 + m01*r12 + m02*r22
    this.rot[3] = m10*r00 + m11*r10 + m12*r20
    this.rot[4] = m10*r01 + m11*r11 + m12*r21
    this.rot[5] = m10*r02 + m11*r12 + m12*r22
    this.rot[6] = m20*r00 + m21*r10 + m22*r20
    this.rot[7] = m20*r01 + m21*r11 + m22*r21
    this.rot[8] = m20*r02 + m21*r12 + m22*r22
    // mild angular damping
    const damp = Math.pow(0.98, dt * 60)
    this.angVel[0] *= damp
    this.angVel[1] *= damp
    this.angVel[2] *= damp
  }

  getRotationMatrix3(): Float32Array { return this.rot }
}
