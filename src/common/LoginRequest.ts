import { NetcodeTypes, Schema } from '../n53'

export type LoginRequest = {
  idToken: string
}

export const LoginRequestSchema: Schema<LoginRequest> = {
  idToken: NetcodeTypes.String,
}
