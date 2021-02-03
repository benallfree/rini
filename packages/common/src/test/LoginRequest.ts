import { MessageTypes } from '../netcode'
import { Binpacker, registerSchema } from './binpack'

export type LoginRequest = {
  idToken: string
}

export const LoginRequestSchema = registerSchema(MessageTypes.LoginRequest, {
  idToken: Binpacker.String,
})
