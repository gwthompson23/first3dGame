import { fbm2D } from '@/core/math/noise'

// Shared terrain parameters so render and physics stay in sync
export const TERRAIN_SIZE = 50 // half-extent in world units
export const TERRAIN_FREQ = 0.08 // noise frequency in 1/units
export const TERRAIN_AMP = 1.75 // height amplitude in units

export function heightAt(x: number, z: number): number {
  const n = fbm2D(x * TERRAIN_FREQ, z * TERRAIN_FREQ, 5, 2.0, 0.5)
  return (n - 0.5) * 2.0 * TERRAIN_AMP
}

