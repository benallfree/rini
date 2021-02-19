import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import gpxParser = require('gpxparser')

export const createRouteService = () => {
  const parser = new gpxParser()
  parser.parse(
    readFileSync(
      resolve(dirname(__filename), 'gpx', 'Freeway Drive.gpx')
    ).toString()
  )

  const points: gpxParser.Point[] = []
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
