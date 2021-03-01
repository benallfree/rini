import { Middleware } from '@reduxjs/toolkit'
import { db } from '../../firebase'
import { RootState } from '../index'
import { locationChanged, PointInTime } from '../slices/profileSlice'

export const remoteUpdatePosition: Middleware = (store) => (next) => (action) => {
  const getState = () => store.getState() as RootState
  const oldLocation = getState().profile.location

  const res = next(action)

  const state = getState() as RootState
  const { location } = state.profile

  const { uid } = state.session.tokens

  if (!(uid && location && locationChanged.match(action))) return res

  // console.log('updating rmeote location', { action, state, location, uid })
  const { latitude, longitude, hash } = location
  const position: PointInTime = {
    latitude,
    longitude,
    time: +new Date(),
  }
  const mkpath = (hash: string) => `grid/${hash}/${uid}`
  const path = mkpath(hash)
  // console.log(`writing ${path}`, position)
  db.ref(path).set(position)
  // gc old loc
  if (oldLocation && oldLocation.hash !== hash) {
    db.ref(mkpath(oldLocation.hash)).remove()
  }

  return res
}
