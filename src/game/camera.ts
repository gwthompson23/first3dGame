import { Mat4, Vec3, mat4Identity, mat4LookAt, mat4Multiply, mat4Perspective } from '@/core/math/math'

export class Camera {
  position: Vec3 = [0, 1.6, 5]
  yaw = 0 // radians
  pitch = 0 // radians
  fov = 70 * Math.PI / 180
  near = 0.1
  far = 100
  aspect = 1

  private view: Mat4 = new Float32Array(16)
  private proj: Mat4 = new Float32Array(16)
  private viewProj: Mat4 = new Float32Array(16)

  constructor(aspect: number) {
    this.aspect = aspect
    mat4Identity(this.view)
    mat4Identity(this.proj)
    mat4Identity(this.viewProj)
    this.updateProjection()
    this.updateView()
  }

  updateProjection() {
    mat4Perspective(this.proj, this.fov, this.aspect, this.near, this.far)
    this.updateViewProj()
  }

  setAspect(aspect: number) {
    this.aspect = aspect
    this.updateProjection()
  }

  addYawPitch(dyaw: number, dpitch: number) {
    this.yaw += dyaw
    this.pitch += dpitch
    const limit = (89 * Math.PI) / 180
    if (this.pitch > limit) this.pitch = limit
    if (this.pitch < -limit) this.pitch = -limit
    this.updateView()
  }

  private updateView() {
    const cp = Math.cos(this.pitch)
    const sp = Math.sin(this.pitch)
    const cy = Math.cos(this.yaw)
    const sy = Math.sin(this.yaw)
    // Forward vector (right-handed, -Z forward at yaw=0, pitch=0)
    const fx = cp * sy
    const fy = sp
    const fz = -cp * cy
    const target: Vec3 = [this.position[0] + fx, this.position[1] + fy, this.position[2] + fz]
    mat4LookAt(this.view, this.position, target, [0, 1, 0])
    this.updateViewProj()
  }

  // Recompute view matrix after externally mutating position
  sync() {
    this.updateView()
  }

  private updateViewProj() {
    // viewProj = proj * view
    mat4Multiply(this.viewProj, this.proj, this.view)
  }

  getViewProj(): Mat4 { return this.viewProj }
  getView(): Mat4 { return this.view }
  getProj(): Mat4 { return this.proj }
}
