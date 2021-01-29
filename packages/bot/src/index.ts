import { createClientNetcode } from '@rini/client'
import { readFileSync } from 'fs'
import gpxParser, { Point } from 'gpxparser'
import { resolve } from 'path'

const parser = new gpxParser()
parser.parse(
  readFileSync(resolve(__dirname, '..', 'gpx', 'Freeway Drive.gpx')).toString()
)

const points: Point[] = []
parser.tracks.forEach((track) => {
  track.points.forEach((point) => {
    points.push(point)
  })
})

const createBot = (speedMs = 100, updateMs = 500) => {
  const splitIdx = Math.floor(Math.random() * points.length - 1)
  const a = points.slice(0, splitIdx)
  const b = points.slice(splitIdx)
  const final = [...b, ...a]

  ;(async () => {
    const client = createClientNetcode()

    let idx = 0

    const move = () => {
      idx++
      if (idx >= final.length) idx = 0
      console.log(`Moved to `, final[idx])
      setTimeout(move, speedMs)
    }
    setTimeout(move, speedMs)

    const ping = () => {
      console.log(`Ping from `, final[idx])
      client.updatePosition({
        latitude: final[idx].lat,
        longitude: final[idx].lon,
      })
      setTimeout(ping, updateMs)
    }
    ping()
  })()
}

createBot()
