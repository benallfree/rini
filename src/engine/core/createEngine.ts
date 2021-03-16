import 'firebase/auth'
import { getDistance } from 'geolib'
import { callem } from '../../callem'
import { RootState, StoreProvider } from '../redux'
import { Settings } from '../redux/gameSlice'
import { EntityId, Movement } from '../storage/Database'
import {
  EntityUpdatedEvent,
  StorageProvider,
} from '../storage/providers/FirebaseRealtimeDatabaseProvider'
import { ENTITY_TTL, MAX_HIT_DISTAANCE } from './const'
import { createDeferredActionService, DeferredActionHandler } from './DeferredAction'
import { Timeout } from './types'

interface Config {
  onDeferredDispatch: DeferredActionHandler
  store: StoreProvider
  storage: StorageProvider
  uid?: EntityId
}

export const createEngine = (config: Config) => {
  const { storage, store, onDeferredDispatch, uid } = config
  const { actions, dispatch, getState, subscribe } = store

  const {
    uidKnown,
    engineReady,
    playerMovementUpdated,
    nearbyEntityRemoved,
    nearbyEntityUpdated,
    onlineStatusChanged,
    settingsUpdated,
  } = actions

  const [onPlayerMovementChanged, emitPlayerMovementChanged] = callem<Movement>()

  const deferredDispatch = createDeferredActionService({
    onExecuteDeferredActions: onDeferredDispatch,
  })

  if (uid) {
    dispatch(uidKnown(uid))
  }

  const handleGridEntityUpdated = (() => {
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
      if (position.time < getState().game.nearbyEntitiesById[id]?.time) return // Incoming entity update is older than current info. Ignore this update.

      clearTimeout(positionTimeouts[id])
      positionTimeouts[id] = setTimeout(() => {
        console.log('Entity stopped updating, purging from state and db', id)
        gc().catch(console.error)
        deferredDispatch(() => dispatch(nearbyEntityRemoved(id)))
      }, ENTITY_TTL)
      const playerPosition = getState().game.player.movement
      if (!playerPosition) {
        throw new Error(`Player position must be known before updating nearby entity`)
      }
      const distance = getDistance(position, playerPosition)
      // console.log('handleEntityUpdated', id, { position, distance })
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
              hasPosition: !!state.game.player.movement,
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

        // Begin listening for nearby enttity updates
        storage.onGridEntityUpdated(handleGridEntityUpdated)
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
    dispatch: {
      updatePlayerMovement: (movement: Movement) => {
        const uid = uidOrDie()
        // console.log('updating position for ', uid, position)
        deferredDispatch(() => {
          dispatch(playerMovementUpdated(movement))
          emitPlayerMovementChanged(movement)
        })
        // console.log('updatePlayerPosition', uid, position)
        storage.setEntityMovement(uid, movement).catch((e) => console.error(e))
        // console.log(' queuing Took', end - start)
      },
      setPlayerUid: (id: EntityId) => {
        dispatch(uidKnown(id))
      },
      onlineStatusChanged: (isOnline: boolean) => {
        console.log({ isOnline })
        dispatch(onlineStatusChanged(isOnline))
      },
      settingsUpdated: (settings: Settings) => {
        dispatch(settingsUpdated(settings))
      },
    },
    start,
    onPlayerMovementChanged,
  }
}
