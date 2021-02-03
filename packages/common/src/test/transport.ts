import { SmartBuffer } from 'smart-buffer'
import { MessageTypes } from '../netcode'
import {
  binpack,
  BinpackData,
  Binpacker,
  binunpack,
  getSchema,
  Schema,
} from './binpack'

export const MESSAGE_WRAPPER_LENGTH = 2 + 4 + 4 + 1

export type MessageWrapperHeader = {
  length: number
  id: number
  refId: number
  type: MessageTypes
}
export type MessageWrapper<
  TMessage extends BinpackData
> = MessageWrapperHeader & {
  message: TMessage
}

export const MessageWrapperHeaderSchema: Schema = {
  length: Binpacker.Uint16,
  id: Binpacker.Uint32,
  refId: Binpacker.Uint32,
  type: Binpacker.Uint8,
}

let messageId = 0
export const pack = <TMessage extends BinpackData>(
  type: MessageTypes,
  message: TMessage,
  refId = 0
) => {
  type ThisMessageWrapper = MessageWrapper<TMessage>

  const wrapperSchema: Schema = {
    ...MessageWrapperHeaderSchema,
    message: getSchema(type),
  }
  const wrapper: ThisMessageWrapper = {
    length,
    id: messageId++,
    refId,
    type,
    message,
  }
  const packed = binpack(wrapperSchema, wrapper)
  packed.writeOffset = 0
  packed.writeUInt16BE(packed.length - 2) // Write the message length
  packed.readOffset = 0
  packed.writeOffset = packed.length
  return packed
}

export const unpack = <TMessage extends BinpackData>(packed: SmartBuffer) => {
  const header = binunpack<MessageWrapperHeader>(
    MessageWrapperHeaderSchema,
    packed
  )
  const { type } = header
  const messageSchema = getSchema(type)

  const message = binunpack(messageSchema, packed)

  return { ...header, message } as MessageWrapper<TMessage>
}
