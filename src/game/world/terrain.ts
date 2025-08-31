import { fbm2D } from '@/core/math/noise'
import { COURT } from '@/game/world/court'

// Shared terrain parameters so render and physics stay in sync
export const TERRAIN_SIZE = 50 // half-extent in world units
export const TERRAIN_FREQ = 0.08 // noise frequency in 1/units
export const TERRAIN_AMP = 1.75 // height amplitude in units

export function heightAt(x: number, z: number): number {
  // Base procedural terrain
  const n = fbm2D(x * TERRAIN_FREQ, z * TERRAIN_FREQ, 5, 2.0, 0.5)
  let h = (n - 0.5) * 2.0 * TERRAIN_AMP

  // Flatten area for the court around y=0 with a feathered border
  const cx = COURT.center[0]
  const cz = COURT.center[2]
  const halfW = COURT.halfWidth
  const halfL = COURT.length / 2
  const pad = 0.6 // meters: extra flat margin beyond court edges
  const blend = 2.0 // meters: smooth feather from flat to terrain
  const dx = Math.abs(x - cx) - (halfW + pad)
  const dz = Math.abs(z - cz) - (halfL + pad)
  const over = Math.max(Math.max(dx, dz), 0)
  const t = over <= 0 ? 0 : over >= blend ? 1 : (over / blend) * (over / blend) * (3 - 2 * (over / blend))
  // mix(0, h, t)
  h = h * t
  return h
}
