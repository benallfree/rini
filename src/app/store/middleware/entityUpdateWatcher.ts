import { Middleware } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import firebase from 'firebase'
import getHashesNear from 'geohashes-near'
import { RootState } from '../index'
import { nearbyEntitiesChanged, PositionsByEntityId } from '../slices/entitiesSlice'
import { locationChanged } from '../slices/sessionSlice'
import { HASH_PRECISION, SEARCH_RADIUS } from './remoteUpdatePosition'

interface Watcher {
  unsub: () => void
}
interface WatchCollection {
  [_: string]: Watcher
}
const watchers: WatchCollection = {}

export const entityUpdateWatcher: Middleware = (store) => (next) => (action) => {
  const res = next(action)

  const state = store.getState() as RootState

  if (!locationChanged.match(action)) return res

  console.log(`The location changed, time to recalc watchers`)

  const { uid } = state.session.tokens
  if (!uid) return res

  const location = state.session.location
  if (!location) return res

  console.log('updating watchers', { action, state, uid, location })

  const hashesInRadius = getHashesNear(location, HASH_PRECISION, SEARCH_RADIUS, 'meters')
  console.log('new hashes', { hashesInRadius })

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
      const data = snap.val() as PositionsByEntityId
      store.dispatch(nearbyEntitiesChanged(data))

      console.log(path, { data })
    }
    const ref = firebase.database().ref(path)
    const unsub = () => {
      console.log(`Unwatching ${path}`)
      ref.off('value', handleValueChange)
    }
    ref.on('value', handleValueChange)
    watchers[hash] = {
      unsub,
    }
  })

  return res
}
