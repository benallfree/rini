import { MessageTypes } from '..'
import { Binpacker, registerSchema } from '../lib/binpack'

export type LoginRequest = {
  idToken: string
}

export const LoginRequestSchema = registerSchema<LoginRequest>(
  MessageTypes.LoginRequest,
  {
    idToken: Binpacker.String,
  }
)
