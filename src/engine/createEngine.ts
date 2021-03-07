import deepmerge from 'deepmerge'
import { IdenticonKey } from '../app/components/Map/Identicon'
import { auth } from '../app/firebase'
import { CallemUnsubscriber } from '../callem'
import { nanoid } from '../nanoid'
import { createRealtimeStorageProvider } from './FirebaseRealtimeDatabaseProvider/provider'
import { Bearing, createStore, Profile } from './store'
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

      const uid = uidOrDie()
      storage
        .getProfile(uid)
        .then((partialProfile) => {
          const defaultProfile = store.select((state) => state.profile)
          const dbProfile = partialProfile.val() as Partial<Profile> | undefined
          const realProfile = deepmerge(defaultProfile, dbProfile ?? {})
          console.log({ realProfile, defaultProfile, dbProfile })
          store.update((state) => (state.profile = realProfile))
          storage.setProfile(uid, realProfile).catch(console.error)
        })
        .catch(console.error)

      unsub = storage.onEntityUpdated((e) => {
        // console.log(`${uid}->${e.id}`)
        store.trackEntity(e)
      })
      return unsub
    }
  })()

  const uidOrDie = () => {
    const uid = config.uid ?? auth.currentUser?.uid
    if (!uid) {
      throw new Error(`Attempted to update player position before UID was known`)
    }
    return uid
  }

  return {
    ...store,
    setAvatarSalt: (type: IdenticonKey, salt: string) => {
      const uid = uidOrDie()
      storage.setAvatarSalt(uid, type, salt).catch(console.error)
      store.update((state) => (state.profile.avatar.salts[type] = salt))
    },
    setAvatarType: (type: IdenticonKey) => {
      const uid = uidOrDie()
      storage.setAvatarType(uid, type).catch(console.error)
      store.update((state) => (state.profile.avatar.type = type))
    },
    onNearbyEntityHit: store.onNearbyEntityHit,
    updatePlayerPosition: (position: Bearing) => {
      const uid = uidOrDie()
      store.updatePlayerPosition(position)
      storage.setPosition(uid, position).catch((e) => console.error(e))
    },
    start,
  }
}
