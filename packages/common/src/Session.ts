import { NetcodeTypes, Schema } from 'n37c0d3'

export type Session = {
  uid: string
}

export const SessionSchema: Schema<Session> = {
  uid: NetcodeTypes.String,
}
