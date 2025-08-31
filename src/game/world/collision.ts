export type AABB = { min: [number, number, number]; max: [number, number, number] }

export function resolveCapsuleVsAABB(
  pos: [number, number, number], // feet position
  radius: number,
  height: number,
  box: AABB,
): { correction: [number, number, number]; normal: [number, number, number] } | null {
  const px = pos[0]
  const py0 = pos[1] + radius
  const py1 = pos[1] + Math.max(radius, height - radius)
  const pz = pos[2]

  const qx = clamp(px, box.min[0], box.max[0])
  const qz = clamp(pz, box.min[2], box.max[2])

  let dy = 0
  if (py1 < box.min[1]) dy = box.min[1] - py1
  else if (py0 > box.max[1]) dy = py0 - box.max[1]
  else dy = 0

  const dx = px - qx
  const dz = pz - qz
  const dXZ2 = dx*dx + dz*dz
  const dXZ = Math.sqrt(dXZ2)
  const dist = Math.sqrt(dXZ2 + dy*dy)

  if (dist >= radius || dist === 0) return null

  const pen = radius - dist
  const nx = dx / (dist || 1)
  const ny = dy / (dist || 1)
  const nz = dz / (dist || 1)
  return { correction: [nx * pen, ny * pen, nz * pen], normal: [nx, ny, nz] }
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

