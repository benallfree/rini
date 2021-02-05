/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageTypes } from '../netcode'
import { binpack } from '../netcode/lib/binpack'
import {
  MESSAGE_WRAPPER_HEADER_LENGTH,
  pack,
  unpack,
} from '../netcode/lib/transport'
import {
  LoginRequest,
  LoginRequestSchema,
  Session,
  SessionSchema,
} from '../netcode/messages'

beforeAll(() => {
  expect(LoginRequestSchema).toBeDefined()
  expect(SessionSchema).toBeDefined()
})

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
    const packed = pack(MessageTypes.LoginRequest, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 4)
    const unpacked = unpack<LoginRequest>(packed)
    expect(unpacked.message.idToken).toBe('foo')
  })

  test('wrap a LoginReply', () => {
    const data: Session = {
      uid: 'baz',
    }
    const packed = pack(MessageTypes.Session, data, 42)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 4)
    const unpacked = unpack<Session>(packed)
    expect(unpacked.message.uid).toBe('baz')
    expect(unpacked.refId).toBe(42)
  })
})
