import { SchemaLookup } from '..'
import { NetcodeTypes, Schema } from '../binpack'

export type LoginRequest = {
  idToken: string
}

export const LoginRequestSchema = {
  idToken: NetcodeTypes.String,
}

export type Session = {
  uid: string
  previousNames: { name: string }[]
}

export const SessionSchema: Schema<Session> = {
  uid: NetcodeTypes.String,
  previousNames: [{ name: NetcodeTypes.String }],
}

export enum MessageTypes {
  Login = 1,
  Session = 2,
}
export const schemas: SchemaLookup = {
  [MessageTypes.Login]: LoginRequestSchema,
  [MessageTypes.Session]: SessionSchema,
}
