/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBuffer } from 'smart-buffer'
import { binpack, Binpacker, binunpack, Schema } from './binpack'

describe('it can binpack', () => {
  test('a uint8', () => {
    const packed = Binpacker.Uint8.pack(42, new SmartBuffer())
    expect(packed.length).toBe(1)
    expect(Binpacker.Uint8.unpack(packed)).toBe(42)
  })

  test('a schema with a uint8', () => {
    const schema: Schema = {
      baz: Binpacker.Uint8,
    }
    const data = {
      baz: 42,
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(1)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe(42)
  })

  test('a schema with a uint16', () => {
    const schema: Schema = {
      baz: Binpacker.Uint16,
    }
    const data = {
      baz: 65535,
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe(65535)
  })

  test('a schema with a string', () => {
    const schema: Schema = {
      baz: Binpacker.String,
    }
    const data = {
      baz: 'hello world',
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(data.baz.length + 1)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe('hello world')
  })

  test('a schema with a buffer', () => {
    const schema: Schema = {
      baz: Binpacker.SmartBuffer,
    }
    const data = {
      baz: SmartBuffer.fromBuffer(Buffer.from('hello world')),
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(data.baz.length + 2)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz.toString()).toBe('hello world')
  })

  test('data with a bad value will throw in development or test mode', () => {
    const schema = {
      baz: Binpacker.Uint8,
    }
    const data = {
      baz: 'foo',
    }
    expect(() => binpack(schema, data)).toThrowError()
  })

  test('data with a bad value will silently return no value in prod mode', () => {
    const schema = {
      baz: Binpacker.Uint8,
    }
    const data = {
      baz: 'foo',
    }
    process.env.NODE_ENV = 'production'
    expect(() => binpack(schema, data)).not.toThrowError()
    process.env.NODE_ENV = 'test'
  })

  test('a nested schema with uint8', () => {
    const schema = {
      baz: Binpacker.Uint8,
      foo: {
        zab: Binpacker.Uint8,
      },
    }
    const data = {
      baz: 42,
      foo: {
        zab: 255,
      },
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz).toBe(42)
    expect(unpacked.foo.zab).toBe(255)
  })

  test('an array of uint8', () => {
    const schema = {
      baz: [Binpacker.Uint8],
    }
    const data = {
      baz: [42, 255],
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(4)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz[0]).toBe(42)
    expect(unpacked.baz[1]).toBe(255)
  })

  test('a schema with a bad array will throw in development or test mode', () => {
    const schema = {
      baz: [Binpacker.Uint8],
    }
    const data = {
      baz: 42,
    }
    expect(() => binpack(schema, data)).toThrowError()
  })

  test('an array of uint8 objects', () => {
    const schema = {
      baz: [{ foo: Binpacker.Uint8 }],
    }
    const data = {
      baz: [{ foo: 42 }, { foo: 255 }],
    }
    const packed = binpack(schema, data)
    expect(packed.length).toBe(4)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz[0].foo).toBe(42)
    expect(unpacked.baz[1].foo).toBe(255)
  })
})
