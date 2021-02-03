import { MessageTypes } from '../netcode'
import { Binpacker, registerSchema } from './binpack'

export type LoginReply = {
  uid: string
}

export const LoginReplySchema = registerSchema(MessageTypes.LoginReply, {
  uid: Binpacker.String,
})
