import { SmartBuffer } from 'smart-buffer'
import { MessageWrapper } from '../lib'
import { MessageTypes } from '../lib/MessageTypes'
import { packMessage } from '../lib/packMessage'

export type LoginRequest = {
  idToken: string
}
export type LoginResponse = {
  uid: string
}

export const packLoginRequest = (msg: LoginRequest): Buffer => {
  const payload = Buffer.from(msg.idToken)
  return packMessage(
    MessageTypes.LoginRequest,
    0,
    SmartBuffer.fromBuffer(payload)
  )
}

export const unpackLoginRequest = (wrapper: MessageWrapper): LoginRequest => {
  const msg: LoginRequest = {
    idToken: wrapper.payload.toString(),
  }
  return msg
}

export const packLoginResponse = (
  wrapper: MessageWrapper,
  msg: LoginResponse
): Buffer => {
  const payload = Buffer.from(msg.uid)
  return packMessage(
    MessageTypes.LoginReply,
    wrapper.id,
    SmartBuffer.fromBuffer(payload)
  )
}

export const unpackLoginResponse = (wrapper: MessageWrapper): LoginResponse => {
  const msg: LoginResponse = {
    uid: wrapper.payload.toString(),
  }
  return msg
}
