import { SmartBuffer } from 'smart-buffer'

export enum MessageTypes {
  Login = 0,
  LoginReply = 1,
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

export type RemoteInfo = {
  address: string
  port: number
}

export type MessageWrapper = Header & {
  payload: Buffer
}
