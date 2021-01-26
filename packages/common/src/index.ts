/* eslint-disable @typescript-eslint/no-var-requires */
import type * as dgram from 'dgram'
import { SmartBuffer } from 'smart-buffer'
import { event } from './event'

global.Buffer = require('buffer').Buffer

let messageId = 0

const makeMessage = (type: MessageTypes, payload: SmartBuffer) => {
  const packet = new SmartBuffer()
  packet.writeUInt32BE(messageId++)
  packet.writeUInt8(type)
  packet.writeUInt16BE(payload.length)
  packet.writeBuffer(payload.toBuffer())
  console.log(`Total message length, ${packet.length}`)
  return packet.toBuffer()
}

export const makeAuthMessage = (idToken: string): Buffer => {
  const payload = Buffer.from(idToken)
  console.log(`payload buffer length ${payload.length}`)

  return makeMessage(MessageTypes.Login, SmartBuffer.fromBuffer(payload))
}

const sb = () => new SmartBuffer()

export const makeAckMessage = (id: number): Buffer => {
  return makeMessage(MessageTypes.Ack, sb().writeUInt32BE(id))
}

export enum MessageTypes {
  Login = 0,
  Ack = 1,
}

const HEADER_LEN = (32 + 8 + 16) / 8
const MessageTypeValues = Object.values(MessageTypes).map((v) =>
  parseInt(v.toString(), 10)
)

const msgBuf = sb()
type Header = {
  id: number
  type: MessageTypes
  payloadLength: number
}
let currentHeader: Header | undefined

export type RawMessage = Header & {
  payload: Buffer
}
const [onRawMessage, emitRawMessage] = event<RawMessage>()

export { onRawMessage }

export const handleMessage = (msg: Buffer, rinfo: dgram.RemoteInfo) => {
  msgBuf.writeBuffer(msg)
  if (!currentHeader) {
    if (msgBuf.length < HEADER_LEN) return // nothing to do yet
    console.log(`raw header`, msgBuf.toBuffer())
    currentHeader = {
      id: msgBuf.readUInt32BE(),
      type: msgBuf.readUInt8(),
      payloadLength: msgBuf.readUInt16BE(),
    }
    console.log(`Unpacked header`, { currentHeader })

    if (!currentHeader.id) {
      throw new Error(`Unexpected message ID ${currentHeader.id}`)
    }
    if (!MessageTypeValues.includes(currentHeader.type)) {
      throw new Error(`Unexpected message type ${currentHeader.type}`)
    }
  }
  if (currentHeader) {
    if (msgBuf.length < currentHeader.payloadLength) return // nothing to do yet
    const e: RawMessage = {
      ...currentHeader,
      payload: msgBuf.readBuffer(currentHeader.payloadLength),
    }
    emitRawMessage(e)
    currentHeader = undefined
  }
}
