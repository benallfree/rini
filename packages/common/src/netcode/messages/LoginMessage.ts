/* eslint-disable @typescript-eslint/no-var-requires */
import { SmartBuffer } from 'smart-buffer'
import { ClientMessageSender } from '..'
import { MessageTypes, MessageWrapper } from '../private'
import { packMessage } from '../private/packMessage'
import { sendMessageAndAwaitReply } from '../private/sendMessageAndAwaitReply'

global.Buffer = require('buffer').Buffer

console.log('ayo', global.Buffer)

export type LoginMessage = {
  idToken: string
}
export type LoginReply = {
  uid: string
}
export const packLoginMessage = (msg: LoginMessage): Buffer => {
  const payload = Buffer.from(msg.idToken)
  return packMessage(MessageTypes.Login, 0, SmartBuffer.fromBuffer(payload))
}

export const unpackLoginMessage = (wrapper: MessageWrapper): LoginMessage => {
  const msg: LoginMessage = {
    idToken: wrapper.payload.toString(),
  }
  return msg
}

export const packLoginReply = (
  wrapper: MessageWrapper,
  msg: LoginReply
): Buffer => {
  const payload = Buffer.from(msg.uid)
  return packMessage(
    MessageTypes.Ack,
    wrapper.id,
    SmartBuffer.fromBuffer(payload)
  )
}

export const unpackLoginReply = (wrapper: MessageWrapper): LoginReply => {
  const msg: LoginReply = {
    uid: wrapper.payload.toString(),
  }
  return msg
}

export const sendLoginMessage = async (
  msg: LoginMessage,
  send: ClientMessageSender
): Promise<LoginReply> => {
  const packed = packLoginMessage(msg)
  const wrapper = await sendMessageAndAwaitReply(packed, send)
  return unpackLoginReply(wrapper)
}
