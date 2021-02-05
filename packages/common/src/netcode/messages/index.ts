import { LoginRequest, LoginRequestSchema } from './LoginRequest'
import { NearbyEntities, NearbyEntitiesSchema } from './NearbyEntities'
import { PositionUpdate, PositionUpdateSchema } from './PositionUpdate'
import { Session, SessionSchema } from './Session'

export type AnyMessage =
  | LoginRequest
  | Session
  | PositionUpdate
  | NearbyEntities

export {
  NearbyEntities,
  NearbyEntitiesSchema,
  LoginRequest,
  LoginRequestSchema,
  PositionUpdate,
  PositionUpdateSchema,
  Session,
  SessionSchema,
}
