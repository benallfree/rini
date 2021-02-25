import { getDistance } from 'geolib'
import gpxParser from 'gpxparser'
import interpolateLineRange from 'line-interpolate-points'

export type GpxPoint = gpxParser.Point
export type GpxRoute = GpxPoint[]

export const createRouteService = (points: GpxRoute) => {
  const makeRoute = (mph: number, updateMs: number, _splitIdx?: number) => {
    const metersPerSecond = mph / 2.237
    const metersPerUpdate = metersPerSecond / (1000 / updateMs)

    const totalDistance = points.reduce((carry, p, i) => {
      const next = i + 1 >= points.length ? 0 : i + 1
      return carry + getDistance(points[i], points[next])
    }, 0)
    const totalPoints = Math.ceil(totalDistance / metersPerUpdate)
    const interpolated = interpolateLineRange(
      points.map((p) => [p.lat, p.lon]),
      totalPoints
    ).map(([lat, lng]) => ({ lat, lng }))

    const splitIdx = _splitIdx ?? Math.floor(Math.random() * interpolated.length - 1)
    const a = interpolated.slice(0, splitIdx)
    const b = interpolated.slice(splitIdx)
    const final = (() => {
      const final = [...b, ...a]
      if (Math.random() > 0.5) return final
      return final.reverse()
    })()
    let idx = 0

    const next = () => {
      const oldIdx = idx
      idx++
      if (idx >= final.length) idx = 0
      return { ...final[idx], distanceFromLast: getDistance(final[oldIdx], final[idx]) }
    }

    return next
  }
  return {
    makeRoute,
  }
}

export type RouteService = ReturnType<typeof createRouteService>
