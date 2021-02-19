import { createNetcode } from '../n53'
import { LoginRequest } from './LoginRequest'
import { NearbyEntities } from './NearbyEntities'
import { PositionUpdate } from './PositionUpdate'
import { Session } from './Session'

export type AnyMessage =
  | LoginRequest
  | Session
  | PositionUpdate
  | NearbyEntities

export { NearbyEntities, LoginRequest, PositionUpdate, Session }

export enum MessageTypes {
  Login = 1,
  Session = 2,
  NearbyEntities = 3,
  PositionUpdate = 4,
}
export const netcode = createNetcode()
