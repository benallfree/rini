import { XpUpdate } from '../../common'

export interface Entity extends PointInTime {
  id: string
}

export interface NearbyEntity extends Entity {
  distance: number
  tid: ReturnType<typeof setTimeout>
}

export interface NearbyEntitiesById {
  [_: string]: NearbyEntity
}

export interface EntitiesState {
  nearby: NearbyEntitiesById
}

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
