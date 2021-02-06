/* eslint-disable @typescript-eslint/no-explicit-any */

import { Binpacker } from '../dist/netcode/lib/binpack'
import {
  createMessageHandler,
  createTransportPacker,
  MessageTypes,
  MESSAGE_WRAPPER_HEADER_LENGTH,
} from '../src'
import { binpack } from '../src/binpack'

describe('it can receive messages', () => {
  test('byte stream with invalid start is discarded', () => {
    const data = {
      idToken: 'foo',
    }
    const packed = binpack(
      {
        idToken: Binpacker.String,
      },
      data
    )
    expect(packed.length).toBe(4)

    const transport = createTransportPacker()
    const handler = createMessageHandler(transport)
    const res = handler.handleSocketDataEvent(packed)
    expect(res).toBeUndefined()
  })

  test('byte stream with valid start is handled', () => {
    const data = {
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
