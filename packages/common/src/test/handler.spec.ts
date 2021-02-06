/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMessageHandler, MessageTypes } from '../netcode'
import { binpack } from '../netcode/lib/binpack'
import {
  createTransportPacker,
  MESSAGE_WRAPPER_HEADER_LENGTH,
} from '../netcode/lib/transport'
import {
  LoginRequest,
  LoginRequestSchema,
  SessionSchema,
} from '../netcode/messages'

beforeAll(() => {
  expect(LoginRequestSchema).toBeDefined()
  expect(SessionSchema).toBeDefined()
})

describe('it can receive messages', () => {
  test('byte stream with invalid start is discarded', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const packed = binpack(LoginRequestSchema, data)
    expect(packed.length).toBe(4)

    const transport = createTransportPacker()
    const handler = createMessageHandler(transport)
    const res = handler.handleSocketDataEvent(packed)
    expect(res).toBeUndefined()
  })

  test('byte stream with valid start is handled', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const transport = createTransportPacker()
    const [packed] = transport.pack(MessageTypes.LoginRequest, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 4)

    const handler = createMessageHandler(transport)
    const res = handler.handleSocketDataEvent(packed)
    expect(res).toMatchObject({ message: data })
  })
})
