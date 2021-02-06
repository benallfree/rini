import { MessageTypes } from './MessageTypes'

export const MessageTypeValues = Object.values(MessageTypes).map((v) =>
  parseInt(v.toString(), 10)
)

export type RemoteInfo = {
  address: string
  port: number
}

export * from './MessageHandler'
export * from './MessageTypes'
export * from './transport'
