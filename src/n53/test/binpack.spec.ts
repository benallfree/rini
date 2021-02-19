/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBuffer } from 'smart-buffer'
import { binpack, binunpack, NetcodeTypes, Schema } from '../binpack'

type NearbyCH = {
  latitude: number
  longitude: number
  key: string
  hash: number
}

describe('it can binpack', () => {
  test('a uint8', () => {
    const packed = NetcodeTypes.Uint8.pack(42, new SmartBuffer())
    expect(packed.length).toBe(1)
    expect(NetcodeTypes.Uint8.unpack(packed)).toBe(42)
  })

  test('a schema with a uint8', () => {
    const data = {
      baz: 42,
    }
    type T = typeof data
    const schema: Schema<T> = {
      baz: NetcodeTypes.Uint8,
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(1)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe(42)
  })

  test('a schema with a uint16', () => {
    const data = {
      baz: 65535,
    }
    type T = typeof data
    const schema: Schema<T> = {
      baz: NetcodeTypes.Uint16,
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe(65535)
  })

  test('a schema with a string', () => {
    const data = {
      baz: 'hello world',
    }

    type T = typeof data
    const schema: Schema<T> = {
      baz: NetcodeTypes.String,
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(data.baz.length + 1)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz).toBe('hello world')
  })

  test('a schema with a buffer', () => {
    const data = {
      baz: SmartBuffer.fromBuffer(Buffer.from('hello world')),
    }

    type T = typeof data
    const schema: Schema<T> = {
      baz: NetcodeTypes.SmartBuffer,
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(data.baz.length + 2)
    const unpacked = binunpack(schema, packed)
    expect(unpacked.baz.toString()).toBe('hello world')
  })

  test('a nested schema with uint8', () => {
    const data = {
      baz: 42,
      foo: {
        zab: 255,
      },
    }

    type T = typeof data
    const schema: Schema<T> = {
      baz: NetcodeTypes.Uint8,
      foo: {
        zab: NetcodeTypes.Uint8,
      },
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz).toBe(42)
    expect(unpacked.foo.zab).toBe(255)
  })

  test('an array of uint8', () => {
    const data = {
      baz: [42, 255],
    }
    type T = typeof data
    const schema: Schema<T> = {
      baz: [NetcodeTypes.Uint8],
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(4)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz[0]).toBe(42)
    expect(unpacked.baz[1]).toBe(255)
  })

  test('an empty array of UInt8', () => {
    const data: { baz: { zab: number[] } } = {
      baz: {
        zab: [],
      },
    }
    type T = typeof data
    const schema: Schema<T> = {
      baz: { zab: [NetcodeTypes.Uint8] },
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    expect(packed.readUInt16BE()).toBe(0)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz.zab.length).toBe(0)
  })

  test('an empty array of struct', () => {
    const data: { message: { nearby: NearbyCH[] } } = {
      message: { nearby: [] },
    }
    type T = typeof data
    const schema: Schema<T> = {
      message: {
        nearby: [
          {
            latitude: NetcodeTypes.Float,
            key: NetcodeTypes.String,
            longitude: NetcodeTypes.Float,
            hash: NetcodeTypes.Uint32,
          },
        ],
      },
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(2)
    expect(packed.readUInt16BE()).toBe(0)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.message.nearby.length).toBe(0)
  })

  test('mismatched struct and array', () => {
    const data: { message: { nearby: NearbyCH[] } } = {
      message: { nearby: [] },
    }
    type T = typeof data
    const schema: Schema<T> = {
      message: {
        nearby: {
          latitude: NetcodeTypes.Float,
          key: NetcodeTypes.String,
          longitude: NetcodeTypes.Float,
          hash: NetcodeTypes.Uint32,
        },
      },
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'nearby' is expected to be type 'BinpackStruct' but was type 'Array'/
    )
  })

  test('mismatched array of struct and value', () => {
    const data = {
      message: { nearby: 42 },
    }
    type T = typeof data
    const schema: Schema<T> = {
      message: {
        //@ts-ignore

        nearby: [
          {
            latitude: NetcodeTypes.Float,
            key: NetcodeTypes.String,
            longitude: NetcodeTypes.Float,
            hash: NetcodeTypes.Uint32,
          },
        ],
      },
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'nearby' is expected to be type 'Array<BinpackStruct>' but was type 'number'/
    )
  })

  test('mismatched schema and uint data types', () => {
    const data = { foo: 42 }

    type T = typeof data
    const schema: Schema<T> = {
      //@ts-ignore
      foo: { baz: NetcodeTypes.String },
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'foo' is expected to be type 'BinpackStruct' but was type 'number'/
    )
  })

  test('mismatched array and uint data types', () => {
    const data = { foo: 42 }

    type T = typeof data
    const schema: Schema<T> = {
      //@ts-ignore
      foo: [NetcodeTypes.Uint32],
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'foo' is expected to be type 'Array' but was type 'number'/
    )
  })

  test('mismatched uint and array data types', () => {
    const data = { foo: [42] }

    type T = typeof data
    const schema: Schema<T> = {
      //@ts-ignore
      foo: NetcodeTypes.Uint32,
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'foo' is expected to be type 'UInt32' but was type 'Array'/
    )
  })

  test('mismatched array<string> and array<uint> data types', () => {
    const data = { foo: [42] }

    type T = typeof data
    const schema: Schema<T> = {
      //@ts-ignore
      foo: [NetcodeTypes.String],
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'foo\[0]' is expected to be type 'String' but was type 'number'/
    )
  })

  test('mismatched string and uint data types', () => {
    const data = { foo: 42 }

    type T = typeof data
    const schema: Schema<T> = {
      //@ts-ignore
      foo: NetcodeTypes.String,
    }

    expect(() => binpack(schema, data)).toThrowError(
      /Key 'foo' is expected to be type 'String' but was type 'number'/
    )
  })

  test('an array of uint8 objects', () => {
    const data = {
      baz: [{ foo: 42 }, { foo: 255 }],
    }
    type T = typeof data
    const schema: Schema<T> = {
      baz: [{ foo: NetcodeTypes.Uint8 }],
    }

    const packed = binpack(schema, data)
    expect(packed.length).toBe(4)
    const unpacked = binunpack<typeof data>(schema, packed)
    expect(unpacked.baz[0].foo).toBe(42)
    expect(unpacked.baz[1].foo).toBe(255)
  })
})
