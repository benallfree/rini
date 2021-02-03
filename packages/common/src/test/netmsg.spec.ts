/* eslint-disable @typescript-eslint/no-explicit-any */

import { SmartBuffer } from 'smart-buffer'
import { MessageTypes } from '../netcode'
import {
  binpack,
  BinpackData,
  Binpacker,
  binunpack,
  Schema,
} from './binpack.spec'

export type MessageWrapperHeader = {
  id: number
  refId: number
  type: MessageTypes
}

export type MessageWrapper<
  TCode extends MessageTypes,
  TMessage extends BinpackData
> = MessageWrapperHeader & {
  type: TCode
  message: TMessage
}

export const MessageWrapperSchemaBase: Schema = {
  id: Binpacker.Uint32,
  refId: Binpacker.Uint32,
  type: Binpacker.Uint8,
}

const makeWrapPacker = <TMessage extends BinpackData>(
  type: MessageTypes,
  messageSchema: Schema
) => {
  type ThisMessageWrapper = MessageWrapper<typeof type, TMessage>
  const wrapperSchema: Schema = {
    ...MessageWrapperSchemaBase,
    message: messageSchema,
  }
  return {
    pack(id: number, refId: number, message: TMessage) {
      const wrapper: ThisMessageWrapper = {
        id,
        refId,
        type,
        message,
      }
      return binpack(wrapperSchema, wrapper)
    },
    unpack: (packed: SmartBuffer) => {
      const wrapper = binunpack<ThisMessageWrapper>(wrapperSchema, packed)

      return wrapper
    },
  }
}

const unpackAnyWrapped = (packed: SmartBuffer) => {
  const header = binunpack<MessageWrapperHeader>(
    MessageWrapperSchemaBase,
    packed
  )
  const { type } = header
  switch (type) {
    case MessageTypes.LoginRequest:
      return {
        ...header,
        message: binunpack<LoginRequest>(LoginRequestSchema, packed),
      } as MessageWrapper<typeof type, LoginRequest>
    case MessageTypes.LoginReply:
      return {
        ...header,
        message: binunpack<LoginReply>(LoginReplySchema, packed),
      } as MessageWrapper<typeof type, LoginReply>
    default:
      throw new Error(`Unhandled message type ${type}`)
  }
}

const unpackTransportToAnyWrapped = (packed: SmartBuffer) => {
  const unpacked = Transport.unpack(packed)
  return unpackAnyWrapped(unpacked.packed)
}

export type TransportMessage = { packed: SmartBuffer }
const TransportSchema: Schema = {
  packed: Binpacker.SmartBuffer,
}

const Transport = {
  pack: (packed: SmartBuffer) => {
    return binpack(TransportSchema, { packed })
  },
  unpack: (packed: SmartBuffer) => {
    const unpacked = binunpack<TransportMessage>(TransportSchema, packed)
    return unpacked
  },
}

export type LoginRequest = {
  idToken: string
}

export type LoginRequestWrapper = MessageWrapper<
  MessageTypes.LoginRequest,
  LoginRequest
>

export const LoginRequestSchema = {
  idToken: Binpacker.String,
}

export const LoginRequestPacker = makeWrapPacker<LoginRequest>(
  MessageTypes.LoginRequest,
  LoginRequestSchema
)

export type LoginReply = {
  uid: string
}

export type LoginReplyWrapper = MessageWrapper<
  MessageTypes.LoginReply,
  LoginReply
>

export const LoginReplySchema = {
  uid: Binpacker.String,
}

export const LoginReplyPacker = makeWrapPacker<LoginReply>(
  MessageTypes.LoginReply,
  LoginReplySchema
)

export const MESSAGE_WRAPPER_LENGTH = 4 + 4 + 1

describe('it can netmsg', () => {
  test('pack a LoginRequest', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const packed = binpack(LoginRequestSchema, data)
    expect(packed.length).toBe(4)
  })

  test('wrap a LoginRequest', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const packed = LoginRequestPacker.pack(1, 42, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    const unpacked = LoginRequestPacker.unpack(packed)
    expect(unpacked.message.idToken).toBe('foo')
  })

  test('wrap a LoginReply', () => {
    const data: LoginReply = {
      uid: 'baz',
    }
    const packed = LoginReplyPacker.pack(1, 42, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    const unpacked = LoginReplyPacker.unpack(packed)
    expect(unpacked.message.uid).toBe('baz')
  })

  test('universal unwrapper', () => {
    const request: LoginRequest = {
      idToken: 'foo',
    }
    const reply: LoginReply = {
      uid: 'baz',
    }
    const packedRequest = LoginRequestPacker.pack(1, 42, request)
    const packedReply = LoginReplyPacker.pack(1, 42, reply)
    expect(packedRequest.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    expect(packedReply.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    const unpackedRequest = unpackAnyWrapped(
      packedRequest
    ) as LoginRequestWrapper
    const unpackedReply = unpackAnyWrapped(packedReply) as LoginReplyWrapper
    expect(unpackedRequest.type).toBe(MessageTypes.LoginRequest)
    expect(unpackedRequest.message.idToken).toBe('foo')
    expect(unpackedReply.type).toBe(MessageTypes.LoginReply)
    expect(unpackedReply.message.uid).toBe('baz')
  })

  test('message transport wrapper', () => {
    const data: LoginReply = {
      uid: 'baz',
    }
    const packedReply = LoginReplyPacker.pack(1, 42, data)
    const packedTransport = Transport.pack(packedReply)
    expect(packedTransport.length).toBe(packedReply.length + 2)
    expect(packedTransport.readUInt16BE()).toBe(packedReply.length)

    packedTransport.readOffset = 0
    expect(Transport.unpack(packedTransport).packed.length).toBe(
      packedReply.length
    )

    packedTransport.readOffset = 0
    const unpackedLoginReply = unpackTransportToAnyWrapped(
      packedTransport
    ) as LoginReplyWrapper
    expect(unpackedLoginReply.message.uid).toBe('baz')
  })
})
