import { SchemaLookup } from 'n37c0d3'
import { LoginRequest, LoginRequestSchema } from './LoginRequest'
import { NearbyEntities, NearbyEntitiesSchema } from './NearbyEntities'
import { PositionUpdate, PositionUpdateSchema } from './PositionUpdate'
import { Session, SessionSchema } from './Session'

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

export const schemas: SchemaLookup = {
  [MessageTypes.Login]: LoginRequestSchema,
  [MessageTypes.Session]: SessionSchema,
  [MessageTypes.NearbyEntities]: NearbyEntitiesSchema,
  [MessageTypes.PositionUpdate]: PositionUpdateSchema,
}
