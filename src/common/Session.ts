import { NetcodeTypes, Schema } from '../n53'

export type Session = {
  uid: string
}

export const SessionSchema: Schema<Session> = {
  uid: NetcodeTypes.String,
}
