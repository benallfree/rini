import { XpUpdate } from '../../common'
import { makeStore } from './makeStore'
import { Entity } from './slices/entitiesSlice'
export interface PointsByEntityId {
  [_: string]: PointInTime
}
export interface Point {
  latitude: number
  longitude: number
}

export interface PointInTime extends Point {
  time: number
}

export interface HashedPointInTime extends PointInTime {
  hash: string
}
export interface CollisionEvent {
  type: 'collision'
  entity: Entity
  time: number
}
interface CollisionEventsByEntityId {
  [_: string]: CollisionEvent
}
type AnyEvent = CollisionEvent
export interface ProfileState {
  events: AnyEvent[]
  collisionEventsByEntityId: CollisionEventsByEntityId
  location?: HashedPointInTime
  xp?: XpUpdate
}

export type Store = ReturnType<typeof makeStore>

export type RootState = ReturnType<Store['store']['getState']>
export type AppDispatch = Store['store']['dispatch']

export type AppThunk<T> = (payload: T) => (dispatch: AppDispatch, getState: () => RootState) => void
