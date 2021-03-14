import { sample } from '@s-libs/micro-dash'
import { Coord } from '@turf/helpers'
import { bearing } from '@turf/turf'
import { getDistance } from 'geolib'
import gpxParser from 'gpxparser'
import interpolateLineRange from 'line-interpolate-points'
import { Bearing, Point } from '../engine/Database'

export type GpxPoint = gpxParser.Point
export type GpxRoute = GpxPoint[]

export const createRouteService = (routes: GpxRoute[]) => {
  const makeRoute = (mph: number, updateMs: number, _splitIdx?: number) => {
    const points = sample(routes)
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

    let idx = Math.floor(Math.random() * interpolated.length)
    let delta = Math.random() > 0.5 ? 1 : -1

    const nextIdx = (idx: number, peek = false) => {
      const newIdx = idx + delta
      if (newIdx < 0) {
        if (!peek) delta = delta * -1
        return 0
      }
      if (newIdx >= interpolated.length) {
        if (!peek) delta = delta * -1
        return interpolated.length - 1
      }
      return idx + delta
    }

    const next = (): Bearing => {
      idx = nextIdx(idx)
      const starting: Coord = {
        type: 'Point',
        coordinates: [interpolated[idx].longitude, interpolated[idx].latitude],
      }
      const ending: Coord = {
        type: 'Point',
        coordinates: [
          interpolated[nextIdx(idx, true)].longitude,
          interpolated[nextIdx(idx, true)].latitude,
        ],
      }
      // console.log({
      //   starting,
      //   ending,
      //   distance: getDistance(interpolated[idx], interpolated[nextIdx(idx, true)]),
      // })
      return {
        ...interpolated[idx],
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
