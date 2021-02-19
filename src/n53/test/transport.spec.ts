/* eslint-disable @typescript-eslint/no-explicit-any */

import { createNetcode } from '..'
import { binpack } from '../binpack'
import { MESSAGE_WRAPPER_HEADER_LENGTH } from '../transport'
import {
  LoginRequest,
  LoginRequestSchema,
  MessageTypes,
  schemas,
  Session,
} from './types'

describe('it can netmsg', () => {
  test('throws if trying to pack an invalid schema type', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const { pack, unpack } = createNetcode(schemas)
    expect(() => pack(42, data)).toThrowError(
      /Schema '42' does not exist. Did you forget to add it?/
    )
  })

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
    const { pack, unpack } = createNetcode(schemas)
    const [packed] = pack(MessageTypes.Login, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 4)
    const unpacked = unpack<LoginRequest>(packed)
    expect(unpacked.message.idToken).toBe('foo')
  })

  test('wrap a LoginReply', () => {
    const data: Session = {
      uid: 'baz',
      previousNames: [],
    }
    const { pack, unpack } = createNetcode(schemas)
    const [packed] = pack(MessageTypes.Session, data, 42)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 6)
    const unpacked = unpack<Session>(packed)
    expect(unpacked.message.uid).toBe('baz')
    expect(unpacked.refId).toBe(42)
  })

  test('expect length to be correct', () => {
    const data: Session = {
      uid: 'baz',
      previousNames: [],
    }
    const { pack, unpack } = createNetcode(schemas)
    const [packed, certified] = pack(MessageTypes.Session, data, 42)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 6)
    expect(certified.length).toBe(packed.length)
  })
})
