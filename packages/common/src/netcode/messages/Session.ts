import { MessageTypes } from '..'
import { Binpacker, registerSchema } from '../lib/binpack'

export type Session = {
  uid: string
}

export const SessionSchema = registerSchema(MessageTypes.Session, {
  uid: Binpacker.String,
})
