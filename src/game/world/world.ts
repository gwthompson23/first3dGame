import type { AABB } from './collision'
import { COURT } from '@/game/world/court'

export const WORLD_BOXES: AABB[] = [
  // Cube rendered at origin with extents -1..1 on each axis
  { min: [-1, -1, -1], max: [1, 1, 1] },
  // Hoop pole (approx AABB)
  (() => {
    const cx = COURT.center[0]
    const baseZ = COURT.baselineZ
    const poleW = 0.18
    const poleD = 0.18
    const poleH = 3.4
    const poleZ = baseZ - 0.8
    const min: [number, number, number] = [cx - poleW/2, 0, poleZ - poleD/2]
    const max: [number, number, number] = [cx + poleW/2, poleH, poleZ + poleD/2]
    return { min, max }
  })(),
  // Backboard (thin box)
  (() => {
    const cx = COURT.center[0]
    const backZ = COURT.backboardZ
    const boardW = 1.829
    const boardH = 1.067
    const boardT = 0.05
    const rimY = COURT.hoopCenter[1]
    const boardCenterY = rimY + 0.305
    const min: [number, number, number] = [cx - boardW/2, boardCenterY - boardH/2, backZ - boardT/2]
    const max: [number, number, number] = [cx + boardW/2, boardCenterY + boardH/2, backZ + boardT/2]
    return { min, max }
  })(),
]
