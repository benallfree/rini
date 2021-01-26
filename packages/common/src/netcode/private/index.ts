import * as dgram from 'dgram'
import { SmartBuffer } from 'smart-buffer'

export enum MessageTypes {
  Login = 0,
  Ack = 1,
}

export const HEADER_LEN = (32 + 32 + 8 + 16) / 8
export const MessageTypeValues = Object.values(MessageTypes).map((v) =>
  parseInt(v.toString(), 10)
)

export const sb = () => new SmartBuffer()

export type Header = {
  id: number
  refMessageId: number
  address: string
  port: number
  type: MessageTypes
  payloadLength: number
}

export type RemoteInfo = dgram.RemoteInfo

export type MessageWrapper = Header & {
  payload: Buffer
}
