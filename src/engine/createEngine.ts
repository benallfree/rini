import deepmerge from 'deepmerge'
import 'firebase/auth'
import { getDistance } from 'geolib'
import { callem } from '../callem'
import { AvatarSalt, Bearing, EntityId, IdenticonKey, Profile } from './Database'
import { EntityUpdatedEvent, StorageProvider } from './FirebaseRealtimeDatabaseProvider'
import { DeferredDispatchHandler, makeDeferredDispatch, RootState, StoreProvider } from './restore'
import { DEFAULT_PROFILE } from './restore/gameSlice'
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
  const { storage, store, onDeferredDispatch, uid } = config
  const { actions, dispatch, getState, subscribe } = store

  const {
    uidKnown,
    userProfileUpdated,
    engineReady,
    avatarSaltUpdated,
    avatarTypeUpdated,
    playerPositionUpdated,
    nearbyEntityRemoved,
    nearbyEntityUpdated,
    onlineStatusChanged,
  } = actions

  const [onPlayerPositionChanged, emitPlayerPositionChanged] = callem<Bearing>()

  const deferredDispatch = makeDeferredDispatch({
    onDeferredDispatch,
  })

  if (uid) {
    dispatch(uidKnown(uid))
  }

  const handleEntityUpdated = (() => {
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
      const playerPosition = getState().game.player.position
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
  const observe = <T extends any>(
    selector: (state: RootState) => T,
    next: (state: RootState, oldValue: T, newValue: T) => void
  ) => {
    let oldValue: T = selector(getState())
    const unsub = subscribe(() => {
      const newValue = selector(getState())
      next(getState(), oldValue, newValue)
      oldValue = newValue
    })
    next(getState(), oldValue, selector(getState()))
    return unsub
  }

  const start = (() => {
    let isStarting = false
    return async () => {
      if (isStarting) return
      isStarting = true

      try {
        // Wait for UID and position before continuing
        await new Promise<void>((resolve) => {
          console.log('Engine waiting for position and UID')
          const unsub = observe(
            (state) => ({
              hasUid: !!state.game.player.uid,
              hasPosition: !!state.game.player.position,
            }),
            (state, oldValue, newValue) => {
              const { hasUid, hasPosition } = newValue
              console.log(`Checking for UID and position`, { hasUid, hasPosition })
              if (hasUid && hasPosition) {
                unsub()
                resolve()
              }
            }
          )
        })

        // Initialize the user's profile
        console.log(`Initializing user profile`)
        const defaultProfile = DEFAULT_PROFILE
        const dbProfile = (await storage.getProfile(uidOrDie())) as Partial<Profile> | null
        const realProfile = deepmerge(defaultProfile, dbProfile ?? {})
        await storage.setProfile(uidOrDie(), realProfile)
        dispatch(userProfileUpdated(realProfile))
        console.log('initialized profile', realProfile)

        // Begin listening for nearby enttity updates
        storage.onEntityUpdated(handleEntityUpdated)
        console.log('listening for entity updates')

        dispatch(engineReady(true))

        // Monitor engine rediness
      } catch (e) {
        console.error(e)
      }
    }
  })()

  const uidOrDie = () => {
    const uid = config.uid ?? getState().game.player.uid
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
    onlineStatusChanged: (isOnline: boolean) => {
      console.log({ isOnline })
      dispatch(onlineStatusChanged(isOnline))
    },
  }
}
