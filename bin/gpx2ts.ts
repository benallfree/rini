/// <reference types="node"/>

import { readFileSync, writeFileSync } from 'fs'
import gpxParser from 'gpxparser'
import { dirname, resolve } from 'path'

const gpxData = readFileSync(
  resolve(dirname(__filename), '../src/bot/gpx/AmbroseLoop.gpx')
).toString()

const parser = new gpxParser()
parser.parse(gpxData)
const points: gpxParser.Point[] = []
parser.tracks.forEach((track) => {
  track.points.forEach((point) => {
    points.push({ ...point, time: point.time ?? new Date() })
  })
})

const ts = `
const raw = ${JSON.stringify(points, null, 2)};
const points = raw.map(p=>({...p, time: new Date(p.time)}));
export default points;
`
writeFileSync(resolve(dirname(__filename), '../src/bot/gpx/parsed/AmbroseLoop.ts'), ts)
