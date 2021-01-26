/* eslint-disable @typescript-eslint/no-var-requires */
import { SmartBuffer } from 'smart-buffer'

global.Buffer = require('buffer').Buffer

let messageId = 0

const makeMessage = (type: MessageTypes, payload: SmartBuffer) => {
  const packet = new SmartBuffer()
  packet.writeUInt32BE(messageId++)
  packet.writeUInt8(type)
  packet.writeUInt16BE(payload.length)
  packet.writeBuffer(payload.toBuffer())
  return packet.toBuffer()
}

export const makeAuthMessage = (idToken: string): Buffer => {
  const payload = Buffer.from(idToken)
  return makeMessage(
    MessageTypes.Hello,
    sb().writeUInt16BE(payload.length).writeBuffer(payload)
  )
}

const sb = () => new SmartBuffer()

export const makeAckMessage = (id: number): Buffer => {
  return makeMessage(MessageTypes.Ack, sb().writeUInt32BE(id))
}

export enum MessageTypes {
  Hello = 0,
  Ack = 1,
}
