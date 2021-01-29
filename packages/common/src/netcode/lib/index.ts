import { MessageTypes } from './MessageTypes'

export const HEADER_LEN = (32 + 32 + 8 + 16) / 8
export const MessageTypeValues = Object.values(MessageTypes).map((v) =>
  parseInt(v.toString(), 10)
)

export type Header = {
  id: number
  refMessageId: number
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

export * from './createMessageHandler'
export * from './MessageTypes'
