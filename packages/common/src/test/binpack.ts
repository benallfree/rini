import { SmartBuffer } from 'smart-buffer'
import { MessageTypes } from '../netcode'

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

const schemas: { [_ in MessageTypes]?: Schema } = {}

export const registerSchema = (type: MessageTypes, schema: Schema) => {
  return (schemas[type] = schema)
}
export const getSchema = (type: MessageTypes) => {
  if (!schemas[type]) {
    throw new Error(`Schema ${type} is not registered.`)
  }
  return schemas[type] as Schema
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
  const unpacked: {
    [_ in keyof Schema]: any
  } = {}
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
