/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBuffer } from 'smart-buffer'

export class BinpackValueError extends Error {}

export type BinpackValue = string | number | Buffer | SmartBuffer | BinpackData
export type BinpackData = {
  [_: string]: BinpackValue | BinpackValue[]
}

export type Packer<TData extends BinpackValue> = {
  _type: string
  pack(n: TData, buf: SmartBuffer): SmartBuffer
  unpack(buf: SmartBuffer): TData
  typecheck(n: TData): boolean
}

export const Binpacker: {
  Uint8: Packer<number>
  Uint16: Packer<number>
  Uint32: Packer<number>
  String: Packer<string>
  Buffer: Packer<Buffer>
  SmartBuffer: Packer<SmartBuffer>
} = {
  Uint8: {
    _type: 'UInt8',
    pack(n, buf) {
      buf.writeUInt8(n)
      return buf
    },
    unpack(buf) {
      return buf.readUInt8()
    },
    typecheck: (n) => typeof n === 'number',
  },
  Uint16: {
    _type: 'UInt16',
    pack(n, buf) {
      buf.writeUInt16BE(n)
      return buf
    },
    unpack(buf) {
      return buf.readUInt16BE()
    },
    typecheck: (n) => typeof n === 'number',
  },
  Uint32: {
    _type: 'UInt32',
    pack(n, buf) {
      buf.writeUInt32BE(n)
      return buf
    },
    unpack(buf) {
      return buf.readUInt32BE()
    },
    typecheck: (n) => typeof n === 'number',
  },
  String: {
    _type: 'String',
    pack(n, buf) {
      buf.writeStringNT(n)
      return buf
    },
    unpack(buf) {
      return buf.readStringNT()
    },
    typecheck: (n) => typeof n === 'string',
  },
  Buffer: {
    _type: 'Buffer',
    pack(n, buf) {
      buf.writeUInt16BE(n.length)
      buf.writeBuffer(n)
      return buf
    },
    unpack(buf) {
      const length = buf.readUInt16BE()
      const ret = buf.readBuffer(length)
      return ret
    },
    typecheck: (n) => n instanceof Buffer,
  },
  SmartBuffer: {
    _type: 'SmartBuffer',
    pack(n, buf) {
      buf.writeUInt16BE(n.length)
      buf.writeBuffer(n.toBuffer())
      return buf
    },
    unpack(buf) {
      const length = buf.readUInt16BE()
      const ret = SmartBuffer.fromBuffer(buf.readBuffer(length))
      return ret
    },
    typecheck: (n) => n instanceof SmartBuffer,
  },
}

export type SchemaValue = Packer<any> | Schema
export type Schema = {
  [_: string]: SchemaValue | SchemaValue[]
}

const typecheck = (packer: Packer<any>, key: string, v: any) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!packer.typecheck(v)) {
      throw new BinpackValueError(
        `Value for ${key} should be ${packer._type} but is ${typeof v}`
      )
    }
  }
}

export const isPacker = (p: SchemaValue) => !!p._type

export const binpack = (
  schema: Schema,
  data: BinpackData,
  buf = new SmartBuffer()
) => {
  const keys = Object.keys(schema)
  keys.forEach((key) => {
    const packerOrSchemaOrArray = schema[key]
    if (Array.isArray(packerOrSchemaOrArray)) {
      const [packerOrSchema] = packerOrSchemaOrArray as SchemaValue[]
      const v = data[key] as BinpackValue[]
      buf.writeUInt16BE(v.length)
      if (packerOrSchema._type) {
        // It's an array of packers
        const packer = packerOrSchema as Packer<any>
        v.forEach((e: any) => {
          typecheck(packer, key, e)
          packer.pack(e, buf)
        })
      } else {
        // It's an array of schemas
        const schema = packerOrSchema as Schema
        v.forEach((e: any) => binpack(schema, e, buf))
      }
    } else {
      const packerOrSchema = packerOrSchemaOrArray
      if (isPacker(packerOrSchema)) {
        const packer = packerOrSchemaOrArray as Packer<any>
        const v = data[key]
        typecheck(packer, key, v)
        packer.pack(v, buf)
      } else {
        binpack(schema[key] as Schema, data[key] as BinpackData, buf)
      }
    }
  })
  return buf
}

export const binunpack = <TData extends BinpackData>(
  schema: Schema,
  packed: SmartBuffer
): TData => {
  const keys = Object.keys(schema)
  const unpacked: { [_ in keyof Schema]: any } = {}
  keys.forEach((key) => {
    const unpackerOrSubtreeOrArray = schema[key]
    if (Array.isArray(unpackerOrSubtreeOrArray)) {
      const [unpackerOrSchema] = unpackerOrSubtreeOrArray as SchemaValue[]
      const count = packed.readUInt16BE()
      const arr = []
      if (unpackerOrSchema._type) {
        // It's an array of unpackers
        const unpacker = unpackerOrSchema as Packer<any>
        for (let i = 0; i < count; i++) {
          arr.push(unpacker.unpack(packed))
        }
      } else {
        // It's an array of schemas
        const schema = unpackerOrSchema as Schema
        for (let i = 0; i < count; i++) {
          arr.push(binunpack(schema, packed))
        }
      }
      unpacked[key] = arr
    } else {
      if (unpackerOrSubtreeOrArray._type) {
        const unpacker = unpackerOrSubtreeOrArray as Packer<any>
        unpacked[key] = unpacker.unpack(packed)
      } else {
        unpacked[key] = binunpack(schema[key] as Schema, packed)
      }
    }
  })
  return unpacked as TData
}

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
