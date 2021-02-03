/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageTypes } from '../netcode'
import { binpack } from './binpack'
import { LoginReply, LoginReplySchema } from './LoginReply'
import { LoginRequest, LoginRequestSchema } from './LoginRequest'
import { MESSAGE_WRAPPER_LENGTH, pack, unpack } from './transport'

beforeAll(() => {
  expect(LoginRequestSchema).toBeDefined()
  expect(LoginReplySchema).toBeDefined()
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
    expect(packed.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    const unpacked = unpack<LoginRequest>(packed)
    expect(unpacked.message.idToken).toBe('foo')
  })

  test('wrap a LoginReply', () => {
    const data: LoginReply = {
      uid: 'baz',
    }
    const packed = pack(MessageTypes.LoginReply, data, 42)
    expect(packed.length).toBe(MESSAGE_WRAPPER_LENGTH + 4)
    const unpacked = unpack<LoginReply>(packed)
    expect(unpacked.message.uid).toBe('baz')
    expect(unpacked.refId).toBe(42)
  })
})
