import deepmerge from 'deepmerge'
import firebase from 'firebase/app'
import 'firebase/auth'
import { getDistance } from 'geolib'
import { callem } from '../callem'
import { AvatarSalt, Bearing, EntityId, IdenticonKey, Profile } from './Database'
import { EntityUpdatedEvent, StorageProvider } from './FirebaseRealtimeDatabaseProvider'
import { DeferredDispatchHandler, makeDeferredDispatch, StoreProvider } from './restore'

export const MAX_HIT_DISTAANCE = 20 // 20 meters

export const ENTITY_TTL = 5000
export type Timeout = ReturnType<typeof setTimeout>

interface Config {
  onDeferredDispatch: DeferredDispatchHandler
  store: StoreProvider
  storage: StorageProvider
  uid?: EntityId
}

export const createEngine = (config: Config) => {
  const { storage, store, onDeferredDispatch } = config
  const { actions, dispatch, getState, subscribe } = store

  const {
    errorOccurred,
    uidKnown,
    userProfileUpdated,
    engineReady,
    avatarSaltUpdated,
    avatarTypeUpdated,
    playerPositionUpdated,
    nearbyEntityRemoved,
    nearbyEntityUpdated,
    nearbyEntityDistanceChanged,
  } = actions

  const [onPlayerPositionChanged, emitPlayerPositionChanged] = callem<Bearing>()

  const deferredDispatch = makeDeferredDispatch({
    onDeferredDispatch,
  })

  const updateEntity = (() => {
    const positionTimeouts: { [_ in EntityId]: Timeout } = {}

    return (e: EntityUpdatedEvent) => {
      const { id, position, gc } = e
      const age = +new Date() - position.time
      if (age > ENTITY_TTL) {
        console.log(`Entity is expired, deleting ${id}`)
        gc().catch(console.error) // This entity is too old, remove it
        return
      }
      if (id === uidOrDie()) return // This is the player, no need to track it locally
      if (position.time < getState().game.nearbyEntitiesById[id]?.time) {
        console.log(`Entity is out of date, deleting ${id}`)
        gc().catch(console.error) // This entity is too old, remove it
        return
      }
      clearTimeout(positionTimeouts[id])
      positionTimeouts[id] = setTimeout(() => {
        console.log('Entity stopped updating, purging', id)
        gc().catch(console.error)
        deferredDispatch(() => dispatch(nearbyEntityRemoved(id)))
      }, ENTITY_TTL)
      const playerPosition = getState().game.position
      if (!playerPosition) {
        throw new Error(`Player position must be known before updating nearby entity`)
      }
      const distance = getDistance(position, playerPosition)
      // console.log(`Entity ${id} is ${distance} meters away`)
      deferredDispatch(() =>
        dispatch(
          nearbyEntityUpdated({
            id,
            ...position,
            distance,
          })
        )
      )
      if (distance <= MAX_HIT_DISTAANCE) {
        // console.log(`Entity ${id} hit ${uidOrDie()}`)
      }
    }
  })()

  /*
  @discussion Start the engine. Multiple calls to start() have no effect.
  
  @returns stop()
  */
  const start = (() => {
    let isStarting = false
    return async () => {
      if (isStarting) return
      isStarting = true

      try {
        // Get the uid and begin watching it
        const uid = await (async () => {
          if (config.uid) return config.uid
          return new Promise<EntityId>((resolve) => {
            const { uid } = firebase.auth().currentUser ?? {}
            if (uid) {
              dispatch(uidKnown(uid))
              resolve(uid)
            }
            firebase.auth().onAuthStateChanged((user) => {
              const { uid } = user ?? {}
              if (!uid) return
              dispatch(uidKnown(uid))
              resolve(uid)
            })
          })
        })()
        console.log('Got UID', uid)

        // Initialize the user's profile
        const defaultProfile = getState().game.profile
        const dbProfile = (await storage.getProfile(uid)) as Partial<Profile> | null
        const realProfile = deepmerge(defaultProfile, dbProfile ?? {})
        await storage.setProfile(uid, realProfile)
        dispatch(userProfileUpdated(realProfile))
        console.log('initialized profile', realProfile)

        // Begin listening for nearby enttity updates
        storage.onEntityUpdated(updateEntity)
        console.log('listening for entity updates')

        dispatch(engineReady())
      } catch (e) {
        console.error(e)
      }
    }
  })()

  const uidOrDie = () => {
    const uid = config.uid ?? getState().game.uid
    if (!uid) {
      throw new Error(`Attempted to update player position before UID was known`)
    }
    return uid
  }

  return {
    store: store.store,
    getState: store.store.getState.bind(store.store),
    setAvatarSalt: (type: IdenticonKey, salt: AvatarSalt) => {
      const uid = uidOrDie()
      storage.setAvatarSalt(uid, type, salt).catch(console.error)
      dispatch(avatarSaltUpdated({ type, salt }))
    },
    setAvatarType: (type: IdenticonKey) => {
      const uid = uidOrDie()
      storage.setAvatarType(uid, type).catch(console.error)
      dispatch(avatarTypeUpdated(type))
    },
    updatePlayerPosition: (position: Bearing) => {
      const uid = uidOrDie()
      // console.log('updating position for ', uid, position)
      deferredDispatch(() => {
        dispatch(playerPositionUpdated(position))
        emitPlayerPositionChanged(position)
      })
      storage.setEntityPosition(uid, position).catch((e) => console.error(e))
      // console.log(' queuing Took', end - start)
    },
    setPlayerUid: (id: EntityId) => {
      dispatch(uidKnown(id))
    },
    start,
    onPlayerPositionChanged,
  }
}
