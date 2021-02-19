/* eslint-disable @typescript-eslint/no-explicit-any */

import { createNetcode } from '..'
import { binpack, BinpackStruct } from '../binpack'
import { MESSAGE_WRAPPER_HEADER_LENGTH } from '../transport'
import {
  LoginRequest,
  LoginRequestSchema,
  MessageTypes,
  schemas,
} from './types'

describe('it can receive messages', () => {
  test('byte stream with invalid start is discarded', () => {
    const data: LoginRequest = {
      idToken: 'foo',
    }
    const packed = binpack(LoginRequestSchema, data)
    expect(packed.length).toBe(4)

    const transport = createNetcode(schemas)
    const { handleSocketDataEvent } = transport
    const res = handleSocketDataEvent(packed)
    expect(res).toBeUndefined()
  })

  test('byte stream with valid start is handled', () => {
    const data: BinpackStruct = {
      idToken: 'foo',
    }
    const transport = createNetcode(schemas)
    const { pack, handleSocketDataEvent } = transport

    const [packed] = pack(MessageTypes.Login, data)
    expect(packed.length).toBe(MESSAGE_WRAPPER_HEADER_LENGTH + 4)

    const res = handleSocketDataEvent(packed)
    expect(res).toMatchObject({ message: data })
  })
})
