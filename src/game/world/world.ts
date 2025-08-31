import type { AABB } from './collision'

export const WORLD_BOXES: AABB[] = [
  // Cube rendered at origin with extents -1..1 on each axis
  { min: [-1, -1, -1], max: [1, 1, 1] },
]

