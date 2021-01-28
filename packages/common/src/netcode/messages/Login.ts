import { SmartBuffer } from 'smart-buffer'
import { ClientMessageSender } from '../createClientNetcode'
import { MessageTypes, MessageWrapper } from '../private'
import { packMessage } from '../private/packMessage'
import { sendMessageAndAwaitReply } from '../private/sendMessageAndAwaitReply'

export type LoginRequest = {
  idToken: string
}
export type LoginResponse = {
  uid: string
}

export const packRequest = (msg: LoginRequest): Buffer => {
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

export const packResponse = (
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

export const unpackResponse = (wrapper: MessageWrapper): LoginResponse => {
  const msg: LoginResponse = {
    uid: wrapper.payload.toString(),
  }
  return msg
}

export const sendLoginRequest = async (
  msg: LoginRequest,
  send: ClientMessageSender
): Promise<LoginResponse> => {
  const packed = packRequest(msg)
  const wrapper = await sendMessageAndAwaitReply(packed, send)
  return unpackResponse(wrapper)
}
