import { createAsyncThunk, Middleware } from '@reduxjs/toolkit'
import { forEach, pick } from '@s-libs/micro-dash'
import firebase from 'firebase'
import getHashesNear from 'geohashes-near'
import Geohash from '../../../latlon-geohash'
import { db } from '../../firebase'
import { HASH_PRECISION, SEARCH_RADIUS } from '../const'
import { HashedPointInTime, Point, PointInTime, PointsByEntityId } from '../types'
import { nearbyEntitiesChanged } from './nearbyEntitiesChanged'
import { nearbyEntityChanged } from './nearbyEntityChanged'
import { getState, makeLiveState } from './util'

interface Watcher {
  unsub: () => void
}
interface WatchCollection {
  [_: string]: Watcher
}
const watchers: WatchCollection = {}

const hashCache: { [_: string]: string[] } = {}

export const entityUpdateWatcher: Middleware = (store) => (next) => (action) => {}

function recalcWatchers(thunkApi: any) {
  const liveState = makeLiveState(thunkApi)
  // console.log(`The location changed, time to recalc watchers`)

  // console.log('updating watchers', { action, state, uid, location })
  const newLocation = liveState.currentLocation()
  const { hash } = newLocation

  const hashesInRadius =
    hashCache[hash] ??
    (hashCache[hash] = getHashesNear(newLocation, HASH_PRECISION, SEARCH_RADIUS, 'meters'))

  // console.log({ hashesInRadius })
  // console.log(hashCache)

  // Stop watching outdated hashes
  forEach(watchers, (watcher, hash) => {
    if (hashesInRadius.includes(hash)) return
    watcher.unsub()
    delete watchers[hash]
  })

  // watch new hashes
  hashesInRadius.forEach((hash) => {
    if (watchers[hash]) return
    const path = `grid/${hash}`
    const handleValueChange = (snap: firebase.database.DataSnapshot) => {
      const data = snap.val() as PointsByEntityId
      thunkApi.dispatch(nearbyEntitiesChanged(data))
      // console.log('updated', path, { data })
    }
    const handleChildAdded = (snap: firebase.database.DataSnapshot) => {
      const data = snap.val() as PointInTime
      if (snap.key === liveState.uid()) return // It is an echo, ignore
      if (!snap.key) throw new Error(`Snapshot has no key on child added`)
      const age = +new Date() - data.time
      if (age > 5000) {
        snap.ref.remove()
      } else {
        thunkApi.dispatch(nearbyEntityChanged({ ...data, id: snap.key }))
      }
      console.log('added', path, { data, snap })
    }
    const handleChildChanged = (snap: firebase.database.DataSnapshot) => {
      const data = snap.val() as PointInTime
      if (snap.key === liveState.uid()) return // It is an echo, ignore
      if (!snap.key) throw new Error(`Snapshot has no key on child added`)
      thunkApi.dispatch(nearbyEntityChanged({ ...data, id: snap.key }))
      // console.log('changed', path, { data }, snap.key)
    }
    const ref = firebase.database().ref(path)
    const unsub = () => {
      // console.log(`Unwatching ${path}`)
      ref.off('child_added', handleChildAdded)
      ref.off('child_changed', handleChildChanged)
    }
    ref.on('child_added', handleChildAdded)
    ref.on('child_changed', handleChildChanged)
    watchers[hash] = {
      unsub,
    }
  })
}

function recalcDistances(thunkApi: any) {
  const state = getState(thunkApi)
  forEach(state.entities.nearby, (entity) => {
    thunkApi.dispatch(nearbyEntityChanged(entity))
  })
}

const broadcastLocation = (thunkApi: any, oldLocation?: HashedPointInTime) => {
  const state = getState(thunkApi)

  const { location } = state.profile
  if (!location) throw new Error(`Location is required here`)
  const { hash } = location

  const { uid } = state.session.tokens
  if (!uid) return // Not logged in yet, skip

  const mkpath = (hash: string) => `grid/${hash}/${uid}`
  const path = mkpath(hash)
  // console.log('broadcastLocation', { location, oldLocation, hash, uid, path })
  const update: PointInTime = pick(location, 'latitude', 'longitude', 'time')
  db.ref(path).set(update)
  // gc old loc - wait for the new loc to arrive. If it never does, gc after 5 seconds
  if (oldLocation && oldLocation.hash !== hash) {
    const gc = () => {
      clearTimeout(tid)
      unsub()
      const oldPath = mkpath(oldLocation.hash)
      console.log(`removing ${oldPath}`)
      db.ref(oldPath).remove()
    }
    const tid = setTimeout(gc, 5000)
    const handleUpdate = (e: firebase.database.DataSnapshot) => {
      const newEntity = e.val() as HashedPointInTime
      if (newEntity.time !== location.time) return // It's the wrong one
      console.log('got a callback!')
      gc()
    }
    const unsub = () => db.ref(path).off('value', handleUpdate)
    db.ref(path).on('value', handleUpdate)
  }
}

export const locationChanged = createAsyncThunk('locationChanged', (point: Point, thunkApi) => {
  const { latitude, longitude } = point
  const hash = Geohash.encode(latitude, longitude, HASH_PRECISION)
  const oldLocation = getState(thunkApi).profile.location
  const newLocation: HashedPointInTime = { ...point, hash, time: +new Date() }
  // console.log('locData', newLocation)
  setTimeout(() => {
    // console.log('Executing post-thunk events')
    recalcDistances(thunkApi)
    recalcWatchers(thunkApi)
    broadcastLocation(thunkApi, oldLocation)
  })
  return newLocation
})
