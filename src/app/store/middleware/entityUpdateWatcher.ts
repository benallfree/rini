import { Middleware } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import firebase from 'firebase'
import getHashesNear from 'geohashes-near'
import { HASH_PRECISION, SEARCH_RADIUS } from '../const'
import { RootState } from '../index'
import { nearbyEntitiesChanged, PointsByEntityId } from '../slices/entitiesSlice'
import { locationChanged, PointInTime } from '../slices/profileSlice'

interface Watcher {
  unsub: () => void
}
interface WatchCollection {
  [_: string]: Watcher
}
const watchers: WatchCollection = {}

const hashCache: { [_: string]: string[] } = {}

export const entityUpdateWatcher: Middleware = (store) => (next) => (action) => {
  const res = next(action)

  const state = store.getState() as RootState

  if (!locationChanged.match(action)) return res

  // console.log(`The location changed, time to recalc watchers`)

  const { uid } = state.session.tokens
  if (!uid) return res

  const location = state.profile.location
  if (!location) return res

  // console.log('updating watchers', { action, state, uid, location })
  const { hash } = location

  const hashesInRadius =
    hashCache[hash] ??
    (hashCache[hash] = getHashesNear(location, HASH_PRECISION, SEARCH_RADIUS, 'meters'))

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
      store.dispatch(nearbyEntitiesChanged({ currentLocation: location, nearby: data }))
      console.log('updated', path, { data })
    }
    const handleChildAdded = (snap: firebase.database.DataSnapshot) => {
      const data = snap.val() as PointInTime
      if (snap.key === uid) return // It is an echo, ignore
      const age = +new Date() - data.time
      if (age > 1000) {
        snap.ref.remove()
      } else {
        store.dispatch(
          nearbyEntitiesChanged({ currentLocation: location, nearby: { [snap.key!]: data } })
        )
      }
      // console.log('added', path, { data, snap })
    }
    const handleChildChanged = (snap: firebase.database.DataSnapshot) => {
      const data = snap.val() as PointInTime
      if (snap.key === uid) return // It is an echo, ignore
      store.dispatch(
        nearbyEntitiesChanged({ currentLocation: location, nearby: { [snap.key!]: data } })
      )
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

  return res
}
