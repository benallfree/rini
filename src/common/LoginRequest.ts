import { NetcodeTypes, Schema } from 'n37c0d3'

export type LoginRequest = {
  idToken: string
}

export const LoginRequestSchema: Schema<LoginRequest> = {
  idToken: NetcodeTypes.String,
}
