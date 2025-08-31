export type Vec3 = [number, number, number]
export type Mat4 = Float32Array

export function mat4Identity(out: Mat4): Mat4 {
  out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0
  out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0
  out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0
  out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1
  return out
}

export function mat4Multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]

  const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3]
  const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7]
  const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11]
  const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15]

  out[0] = a00*b00 + a10*b01 + a20*b02 + a30*b03
  out[1] = a01*b00 + a11*b01 + a21*b02 + a31*b03
  out[2] = a02*b00 + a12*b01 + a22*b02 + a32*b03
  out[3] = a03*b00 + a13*b01 + a23*b02 + a33*b03

  out[4] = a00*b10 + a10*b11 + a20*b12 + a30*b13
  out[5] = a01*b10 + a11*b11 + a21*b12 + a31*b13
  out[6] = a02*b10 + a12*b11 + a22*b12 + a32*b13
  out[7] = a03*b10 + a13*b11 + a23*b12 + a33*b13

  out[8] = a00*b20 + a10*b21 + a20*b22 + a30*b23
  out[9] = a01*b20 + a11*b21 + a21*b22 + a31*b23
  out[10] = a02*b20 + a12*b21 + a22*b22 + a32*b23
  out[11] = a03*b20 + a13*b21 + a23*b22 + a33*b23

  out[12] = a00*b30 + a10*b31 + a20*b32 + a30*b33
  out[13] = a01*b30 + a11*b31 + a21*b32 + a31*b33
  out[14] = a02*b30 + a12*b31 + a22*b32 + a32*b33
  out[15] = a03*b30 + a13*b31 + a23*b32 + a33*b33
  return out
}

export function mat4Perspective(out: Mat4, fovyRad: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovyRad / 2)
  const nf = 1 / (near - far)
  out[0] = f / aspect
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = f
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = (far + near) * nf
  out[11] = -1
  out[12] = 0
  out[13] = 0
  out[14] = (2 * far * near) * nf
  out[15] = 0
  return out
}

export function mat4LookAt(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const [ex, ey, ez] = eye
  let zx = ex - target[0]
  let zy = ey - target[1]
  let zz = ez - target[2]
  let len = Math.hypot(zx, zy, zz)
  if (len === 0) { zx = 0; zy = 0; zz = 1 } else { zx /= len; zy /= len; zz /= len }

  let xx = up[1]*zz - up[2]*zy
  let xy = up[2]*zx - up[0]*zz
  let xz = up[0]*zy - up[1]*zx
  len = Math.hypot(xx, xy, xz)
  if (len === 0) { xx = 1; xy = 0; xz = 0 } else { xx /= len; xy /= len; xz /= len }

  const yx = zy*xz - zz*xy
  const yy = zz*xx - zx*xz
  const yz = zx*xy - zy*xx

  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0
  out[12] = -(xx*ex + xy*ey + xz*ez)
  out[13] = -(yx*ex + yy*ey + yz*ez)
  out[14] = -(zx*ex + zy*ey + zz*ez)
  out[15] = 1
  return out
}

export function degToRad(d: number) { return d * Math.PI / 180 }

export function mat4Ortho(out: Mat4, left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
  const lr = 1 / (left - right)
  const bt = 1 / (bottom - top)
  const nf = 1 / (near - far)
  out[0] = -2 * lr
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = -2 * bt
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = 2 * nf
  out[11] = 0
  out[12] = (left + right) * lr
  out[13] = (top + bottom) * bt
  out[14] = (far + near) * nf
  out[15] = 1
  return out
}
