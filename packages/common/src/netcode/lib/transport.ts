import { MessageTypes } from '..'
import { AnyMessage } from '../messages'
import { binpack, Binpacker, binunpack, getSchema, Schema } from './binpack'

export const MESSAGE_WRAPPER_HEADER_LENGTH = 2 + 4 + 4 + 1

export type MessageWrapperHeader = {
  length: number
  id: number
  refId: number
  type: MessageTypes
}
export type MessageWrapper<
  TMessage extends AnyMessage
> = MessageWrapperHeader & {
  message: TMessage
}

export const MessageWrapperHeaderSchema: Schema<MessageWrapperHeader> = {
  length: Binpacker.Uint16,
  id: Binpacker.Uint32,
  refId: Binpacker.Uint32,
  type: Binpacker.Uint8,
}

let messageId = 0
export const pack = <TMessage extends AnyMessage>(
  type: MessageTypes,
  message: TMessage,
  refId = 0
): Buffer => {
  type ThisMessageWrapper = MessageWrapper<TMessage>

  const wrapperSchema: Schema<MessageWrapper<TMessage>> = {
    ...MessageWrapperHeaderSchema,
    message: getSchema<TMessage>(type),
  }
  const wrapper: ThisMessageWrapper = {
    length: 0,
    id: messageId++,
    refId,
    type,
    message,
  }
  const packed = binpack(wrapperSchema, wrapper)
  packed.writeUInt16BE(packed.length - 2) // Write the message length
  return packed
}

export const unpack = <TMessage extends AnyMessage>(packed: Buffer) => {
  const header = binunpack<MessageWrapperHeader>(
    MessageWrapperHeaderSchema,
    packed
  )
  const { type } = header
  const messageSchema = getSchema<TMessage>(type)
  const message = binunpack<TMessage>(
    messageSchema,
    packed.slice(MESSAGE_WRAPPER_HEADER_LENGTH)
  )

  return { ...header, message } as MessageWrapper<TMessage>
}
