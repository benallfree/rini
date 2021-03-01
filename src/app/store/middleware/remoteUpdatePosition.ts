import { Middleware } from '@reduxjs/toolkit'
import { db } from '../../firebase'
import { RootState } from '../index'
import { locationChanged, PointInTime } from '../slices/sessionSlice'

/*
1	≤ 5,000km	×	5,000km
2	≤ 1,250km	×	625km
3	≤ 156km	×	156km
4	≤ 39.1km	×	19.5km
5	≤ 4.89km	×	4.89km
6	≤ 1.22km	×	0.61km
7	≤ 153m	×	153m
8	≤ 38.2m	×	19.1m
9	≤ 4.77m	×	4.77m
10	≤ 1.19m	×	0.596m
11	≤ 149mm	×	149mm
12	≤ 37.2mm	×	18.6mm
*/
export const HASH_PRECISION = 5
export const SEARCH_RADIUS = 5000

export const remoteUpdatePosition: Middleware = (store) => (next) => (action) => {
  const res = next(action)

  const state = store.getState() as RootState
  const { location } = state.session

  const { uid } = state.session.tokens

  if (!(uid && location && locationChanged.match(action))) return res

  console.log('updating rmeote location', { action, state, location, uid })
  const { latitude, longitude, hash } = location
  const position: PointInTime = {
    latitude,
    longitude,
    time: +new Date(),
  }
  const path = `grid/${hash}/${uid}`
  console.log(`writing ${path}`, position)
  db.ref(path).set(position)

  return res
}
