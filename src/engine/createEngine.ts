import { CallemUnsubscriber } from 'src/callem'
import { auth } from '../app/firebase'
import { nanoid } from '../nanoid'
import { createRealtimeStorageProvider } from './FirebaseRealtimeDatabaseProvider'
import { createStore, Point } from './store'

interface Config {
  uid?: string
  nanoid: typeof nanoid
}

export const createEngine = (config: Config) => {
  const storage = createRealtimeStorageProvider(config)
  const store = createStore()

  /*
  @discussion Start the engine. Multiple calls to start() have no effect.
  
  @returns stop()
  */
  const start = (() => {
    let unsub: CallemUnsubscriber
    return () => {
      if (unsub) return unsub
      unsub = storage.onEntityUpdated((e) => {
        // console.log(`${uid}->${e.id}`)
        store.trackEntity(e)
      })
      return unsub
    }
  })()

  return {
    ...store,
    onNearbyEntityHit: store.onNearbyEntityHit,
    updatePlayerPosition: (position: Point) => {
      const uid = config.uid ?? auth.currentUser?.uid
      if (!uid) {
        throw new Error(`Attempted to update player position before UID was known`)
      }
      store.updatePlayerPosition(position)
      storage.setPosition(uid, position).catch((e) => console.error(e))
    },
    start,
  }
}
