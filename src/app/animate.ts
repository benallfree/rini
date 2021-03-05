import { forEach } from '@s-libs/micro-dash'

/**
 * The method of linear interpolation (lerp) to easing animations.
 *
 * @param {number} x - first value
 * @param {number} y - second value
 * @param {number} a - amount to interpolate between x and y
 * @return {number}
 */
const lerp = (x: number, y: number, a: number) => (1 - a) * x + a * y
export const animate = <T extends { [_: string]: number }>(
  from: T,
  to: T,
  nPoints: number,
  cb: (intermediate: T) => void
) => {
  const intermediate = { ...from }
  const alpha = 1 / nPoints
  for (let i = 0; i < nPoints; i++) {
    forEach(intermediate, (v, k) => {
      intermediate[k] = lerp(from[k], to[k], i * alpha)
    })
    cb(intermediate)
  }
}
