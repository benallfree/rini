import { BufferList } from 'bl'
import { MessageTypes } from '..'
import { AnyMessage } from '../messages'
import { binpack, Binpacker, binunpack, getSchema, Schema } from './binpack'

export const MAGIC_SIZE = 2
export const LENGTH_SIZE = 2
export const START_SENTINAL_SIZE = 4
export const MESSAGE_WRAPPER_HEADER_LENGTH = 2 + 2 + 4 + 4 + 1
export const DEFAULT_MESSAGE_BOUNDARY = 0xc0de

export type MessageWrapperHeader = {
  magic: number
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
  magic: Binpacker.Uint16,
  length: Binpacker.Uint16,
  id: Binpacker.Uint32,
  refId: Binpacker.Uint32,
  type: Binpacker.Uint8,
}

export type TransportPackerConfig = {
  magic: number
}

export const createTransportPacker = (
  config?: Partial<TransportPackerConfig>
) => {
  const _config: TransportPackerConfig = {
    magic: DEFAULT_MESSAGE_BOUNDARY,
    ...config,
  }
  const { magic } = _config

  let messageId = 0

  const pack = <TMessage extends AnyMessage>(
    type: MessageTypes,
    message: TMessage,
    refId = 0
  ): [Buffer, MessageWrapper<TMessage>] => {
    type ThisMessageWrapper = MessageWrapper<TMessage>

    const wrapperSchema: Schema<MessageWrapper<TMessage>> = {
      ...MessageWrapperHeaderSchema,
      message: getSchema<TMessage>(type),
    }
    const wrapper: ThisMessageWrapper = {
      magic,
      length: 0,
      id: messageId++,
      refId,
      type,
      message,
    }
    const packed = binpack(wrapperSchema, wrapper)
    packed.writeUInt16BE(packed.length, MAGIC_SIZE) // Write the message length
    wrapper.length = packed.length
    return [packed, wrapper]
  }

  const unpack = <TMessage extends AnyMessage>(packed: Buffer) => {
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

  const isMessageStart = (buf: Buffer | BufferList, offset = 0) => {
    const maybeMagic = buf.readUInt16BE(offset)
    return maybeMagic === magic
  }

  return { pack, unpack, isMessageStart }
}

export type TransportPacker = ReturnType<typeof createTransportPacker>
