import { readFileSync } from 'fs'
import gpxParser, { Point } from 'gpxparser'
import { resolve } from 'path'

export const createRouteService = () => {
  const parser = new gpxParser()
  parser.parse(
    readFileSync(
      resolve(__dirname, '..', 'gpx', 'Freeway Drive.gpx')
    ).toString()
  )

  const points: Point[] = []
  parser.tracks.forEach((track) => {
    track.points.forEach((point) => {
      points.push(point)
    })
  })

  return {
    points,
  }
}

export type RouteService = ReturnType<typeof createRouteService>
