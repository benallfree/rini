import { BufferList } from 'bl'
import { callem } from 'callem'
import { SchemaLookup } from '.'
import {
  binpack,
  BinpackStruct,
  binunpack,
  NetcodeTypes,
  Schema,
} from './binpack'

export const MAGIC_SIZE = 2
export const LENGTH_SIZE = 2
export const START_SENTINAL_SIZE = 4
export const MESSAGE_WRAPPER_HEADER_LENGTH = 2 + 2 + 4 + 4 + 1
export const DEFAULT_MESSAGE_BOUNDARY = 0xc0de

export type TransportPackerConfig = {
  magic: number
}

export type MessageHeader = {
  magic: number
  length: number
  id: number
  refId: number
  type: number
}

export type MessageWrapper<TMessage extends BinpackStruct> = MessageHeader & {
  message: TMessage
}

export const createTransportPacker = <TMessageTypes>(
  schemas: SchemaLookup,
  config?: Partial<TransportPackerConfig>
) => {
  const _config: TransportPackerConfig = {
    magic: DEFAULT_MESSAGE_BOUNDARY,
    ...config,
  }

  const MessageWrapperHeaderSchema: Schema<MessageHeader> = {
    magic: NetcodeTypes.Uint16,
    length: NetcodeTypes.Uint16,
    id: NetcodeTypes.Uint32,
    refId: NetcodeTypes.Uint32,
    type: NetcodeTypes.Uint8,
  }

  const { magic } = _config

  let messageId = 0

  const assertSchemaExists = (type: number) => {
    if (!(type in schemas)) {
      throw new Error(
        `Schema '${type}' does not exist. Did you forget to add it?`
      )
    }
  }

  const pack = <TMessage extends BinpackStruct>(
    type: number,
    message: TMessage,
    refId = 0
  ): [Buffer, MessageWrapper<TMessage>] => {
    assertSchemaExists(type)
    type ThisMessageWrapper = MessageWrapper<TMessage>
    const wrapperSchema: Schema<MessageWrapper<TMessage>> = {
      ...MessageWrapperHeaderSchema,
      message: schemas[type as number] as Schema<TMessage>,
    }

    const wrapper: ThisMessageWrapper = {
      magic,
      length: 0,
      id: messageId++,
      refId,
      type: type as number,
      message,
    }
    const packed = binpack(wrapperSchema, wrapper)
    packed.writeUInt16BE(packed.length, MAGIC_SIZE) // Write the message length
    wrapper.length = packed.length
    return [packed, wrapper]
  }

  const unpack = <TMessage extends BinpackStruct>(packed: Buffer) => {
    const header = binunpack<MessageHeader>(MessageWrapperHeaderSchema, packed)
    const { type } = header
    const messageSchema = schemas[type] as Schema<TMessage>
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

  const dataBuf = new BufferList()

  const [onRawMessage, emitRawMessage] = callem<MessageWrapper<BinpackStruct>>()

  const fastForwardToMagic = () => {
    if (dataBuf.length === 0) return
    // Find magic start
    let offset = 0
    while (offset <= dataBuf.length - MAGIC_SIZE) {
      if (isMessageStart(dataBuf, offset)) {
        dataBuf.consume(offset)
        return
      }
      offset++
    }
    dataBuf.consume(offset)
  }

  const handleSocketDataEvent = (
    data: Buffer
  ): MessageWrapper<BinpackStruct> | void => {
    dataBuf.append(data)
    fastForwardToMagic()
    console.log('mem used', dataBuf.length)
    if (dataBuf.length < START_SENTINAL_SIZE) return // If it doens't have magic + length, there is nothing to do yet
    const streamLen = dataBuf.readUInt16BE(MAGIC_SIZE)
    if (dataBuf.length < streamLen) return
    const unpacked = unpack(dataBuf.slice(0, streamLen))
    dataBuf.consume(streamLen)
    emitRawMessage(unpacked)
    return unpacked
  }

  return {
    pack,
    unpack,
    handleSocketDataEvent,
    onRawMessage,
  }
}
