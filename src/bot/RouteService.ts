import { Coord } from '@turf/helpers'
import { bearing } from '@turf/turf'
import { getDistance } from 'geolib'
import gpxParser from 'gpxparser'
import interpolateLineRange from 'line-interpolate-points'
import { Bearing, Point } from '../engine/store'

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
    const interpolated: Point[] = interpolateLineRange(
      points.map((p) => [p.lat, p.lon]),
      totalPoints
    ).map(([lat, lng]) => ({ latitude: lat, longitude: lng }))

    const splitIdx = _splitIdx ?? Math.floor(Math.random() * interpolated.length - 1)
    const a = interpolated.slice(0, splitIdx)
    const b = interpolated.slice(splitIdx)
    const final = (() => {
      const final = [...b, ...a]
      if (Math.random() > 0.5) return final
      return final.reverse()
    })()
    let idx = 0

    const nextIdx = (idx: number) => {
      return idx + 1 >= final.length ? 0 : idx + 1
    }

    const next = (): Bearing => {
      const oldIdx = idx
      idx = nextIdx(idx)
      const starting: Coord = {
        type: 'Point',
        coordinates: [final[idx].longitude, final[idx].latitude],
      }
      const ending: Coord = {
        type: 'Point',
        coordinates: [final[nextIdx(idx)].longitude, final[nextIdx(idx)].latitude],
      }
      return {
        ...final[idx],
        time: +new Date(),
        speed: mph,
        heading: bearing(starting, ending),
      }
    }

    return next
  }
  return {
    makeRoute,
  }
}

export type RouteService = ReturnType<typeof createRouteService>
