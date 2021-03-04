import { isEqual, keys, pick } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { callem, CallemEmitter, CallemSubscriber, CallemUnsubscriber } from '../../callem'
import { throttle } from './throttle'

export type Timeout = ReturnType<typeof setTimeout>

export interface Point {
  latitude: number
  longitude: number
}

export interface PointInTime extends Point {
  time: number
}

export interface Entity extends PointInTime {
  id: string
}

export interface NearbyEntity extends Entity {
  distance: number
}

export interface NearbyEntityWithTtl extends NearbyEntity {
  tid: ReturnType<typeof setTimeout>
}

export interface NearbyEntitiesById {
  [_: string]: NearbyEntityWithTtl
}

interface RootState {
  uid?: string
  position?: Point
  nearbyEntitiesById: NearbyEntitiesById
}

export type Setter<T> = (e: T) => void
type Unwatcher = () => void
type Watcher<T> = (cb: Setter<T>) => Unwatcher

export const ENTITY_TTL = 5000
export const MAX_HIT_DISTAANCE = 20 // 20 meters

export const createStore = () => {
  const state: RootState = {
    nearbyEntitiesById: {},
  }

  const [onPlayerPositionUpdated, emitPlayerPositionUpdated] = callem<Point>()
  const [onNearbyEntityAdded, emitNearbyEntityAdded] = callem<NearbyEntity>()
  const [onNearbyEntityHit, emitNearbyEntityHit] = callem<NearbyEntity>()
  const [onNearbyEntityRemoved, emitNearbyEntityRemoved] = callem<NearbyEntity>()

  const watchPlayerPosition: Watcher<Point | undefined> = (setter) => {
    const unsub = onPlayerPositionUpdated(setter)
    setTimeout(() => setter(state.position), 0)
    return unsub
  }

  const getNearbyEntityPositionCallem = (() => {
    const watchers: {
      [_: string]: {
        onNearbyEntityPositionChanged: CallemSubscriber<NearbyEntity>
        emitNearbyEntityPositionChanged: CallemEmitter<NearbyEntity>
      }
    } = {}

    return (id: string) => {
      if (!watchers[id]) {
        const [
          onNearbyEntityPositionChanged,
          emitNearbyEntityPositionChanged,
        ] = callem<NearbyEntity>()
        watchers[id] = { onNearbyEntityPositionChanged, emitNearbyEntityPositionChanged }
      }
      return watchers[id]
    }
  })()

  const watchNearbyEntityPosition = (id: string, setter: Setter<NearbyEntity>): Unwatcher => {
    const { onNearbyEntityPositionChanged } = getNearbyEntityPositionCallem(id)
    const unsub = onNearbyEntityPositionChanged(setter)
    setTimeout(() => setter(state.nearbyEntitiesById[id]), 0)
    return unsub
  }

  const watchNearbyEntityIds: Watcher<string[]> = (setter) => {
    const uid = state.uid
    if (!uid) {
      throw new Error(`Attempting to watch nearby entities before UID is known`)
    }
    const select = () =>
      keys(state.nearbyEntitiesById)
        .sort()
        .filter((id) => id !== uid)
    let last = select()
    const throttledSetter = throttle(setter, 250, { leading: true, trailing: true })
    const fire = () => {
      const current = select()
      if (isEqual(last, current)) return
      last = current
      throttledSetter(current)
    }
    const unsubs: CallemUnsubscriber[] = []
    unsubs.push(onNearbyEntityAdded(fire))
    unsubs.push(onNearbyEntityRemoved(fire))
    setTimeout(() => {
      throttledSetter(last)
      throttledSetter.flush()
    }, 0)
    return () => {
      return unsubs.forEach((u) => u())
    }
  }

  const trackEntity = (entity: Entity) => {
    const { id } = entity
    const { position, uid } = state
    if (!position) {
      throw new Error(`Attempted to add nearby entity before player position was known`)
    }
    if (!uid) {
      throw new Error(`Attempted to add nearby entity before player UID was known`)
    }

    // Create new entity
    const oldEntity = state.nearbyEntitiesById[id]
    if (oldEntity) {
      clearTimeout(oldEntity.tid)
    }
    const newEntity: NearbyEntityWithTtl = {
      ...entity,
      tid: setTimeout(() => {
        delete state.nearbyEntitiesById[id]
        emitNearbyEntityRemoved(newEntity)
      }, ENTITY_TTL),
      distance: getDistance(position, entity),
    }
    state.nearbyEntitiesById[id] = newEntity

    // Send out notifications
    if (!oldEntity) {
      emitNearbyEntityAdded(newEntity)
    } else {
      if (
        !isEqual(pick(newEntity, 'latitude', 'longitude'), pick(oldEntity, 'latitude', 'longitude'))
      ) {
        getNearbyEntityPositionCallem(id).emitNearbyEntityPositionChanged(newEntity)
      }
    }

    // Check for a hit test
    if (newEntity.id !== uid && newEntity.distance < MAX_HIT_DISTAANCE) {
      emitNearbyEntityHit(newEntity)
    }
  }

  const setPlayerUid = (uid: string) => {
    state.uid = uid
  }

  const updatePlayerPosition = (_position: Point) => {
    const oldPos = state.position
    const newPos = pick(_position, 'longitude', 'latitude')
    if (isEqual(oldPos, newPos)) return
    state.position = newPos
    emitPlayerPositionUpdated(newPos)
  }

  const api = {
    setPlayerUid,
    select: <T>(cb: (state: RootState) => T) => cb(state),
    onPlayerPositionUpdated,
    onNearbyEntityHit,
    updatePlayerPosition,
    watchPlayerPosition,
    watchNearbyEntityPosition,
    watchNearbyEntityIds,
    trackEntity,
  }
  return api
}
