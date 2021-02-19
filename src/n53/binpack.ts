/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartBuffer } from 'smart-buffer'

export type TypeOrArrayOfType<T> = T | T[]
export class BinpackValueError extends Error {}

export type BinpackValueTypePrimitive = string | number | Buffer | SmartBuffer

export type BinpackStructElementPrimitive =
  | BinpackValueTypePrimitive
  | BinpackStruct

export type BinpackStructElement = TypeOrArrayOfType<BinpackStructElementPrimitive>

export type BinpackStruct = {
  [_: string]: BinpackStructElement
}

export type SchemaValue<
  TData extends BinpackStructElement = BinpackStructElement
> = TData extends BinpackValueTypePrimitive[]
  ? [Packer<TData[number]>]
  : TData extends BinpackStruct[]
  ? [Schema<TData[number]>]
  : TData extends BinpackValueTypePrimitive
  ? Packer<TData>
  : TData extends BinpackStruct
  ? Schema<TData>
  : never

export type Schema<TData extends BinpackStruct> = {
  [_ in keyof TData]: SchemaValue<TData[_]> | Schema<BinpackStruct>
}

export type Packer<
  TData extends BinpackValueTypePrimitive = BinpackValueTypePrimitive
> = {
  _type: string
  pack(n: TData, buf: SmartBuffer): SmartBuffer
  unpack(buf: SmartBuffer): TData
  typecheck: (v: any) => boolean
}

export const NetcodeTypes: {
  Uint8: Packer<number>
  Uint16: Packer<number>
  Uint32: Packer<number>
  Float: Packer<number>
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
    typecheck: (v: any) => typeof v === 'number',
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
    typecheck: (v: any) => typeof v === 'number',
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
    typecheck: (v: any) => typeof v === 'number',
  },
  Float: {
    _type: 'Float',
    pack(n, buf) {
      buf.writeFloatBE(n)
      return buf
    },
    unpack(buf) {
      return buf.readFloatBE()
    },
    typecheck: (v: any) => typeof v === 'number',
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
    typecheck: (v: any) => typeof v === 'string',
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
    typecheck: (v: any) => v instanceof Buffer,
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
    typecheck: (v: any) => v instanceof SmartBuffer,
  },
}

const assertTypeSafe = (
  key: string,
  v: any,
  typecheck: (v: any) => boolean,
  type: string
) => {
  if (process.env.NODE_ENV === 'production') return
  if (typecheck(v)) return
  throw new Error(
    `Key '${key}' is expected to be type '${type}' but was type '${
      Array.isArray(v) ? 'Array' : typeof v
    }'`
  )
}

const isArray = (v: any): v is [] => Array.isArray(v)

const isObject = (v: any): v is object =>
  !Array.isArray(v) && typeof v === 'object'

const isPacker = (p: any): p is Packer => {
  return typeof p === 'object' && '_type' in p
}

const _pack = <TData extends BinpackStruct>(
  schema: Schema<TData>,
  data: TData,
  buf: SmartBuffer
): Buffer => {
  const keys = Object.keys(schema)
  keys.forEach((key) => {
    const packerOrSchemaOrArray = schema[key]
    if (isArray(packerOrSchemaOrArray)) {
      const packerOrSchema = packerOrSchemaOrArray[0] as
        | Packer
        | Schema<BinpackStruct>
      const v = data[key] as BinpackStructElementPrimitive[]
      buf.writeUInt16BE(v.length)
      if (isPacker(packerOrSchema)) {
        // It's an array of packers
        const v = data[key] as BinpackValueTypePrimitive[]
        assertTypeSafe(key, v, () => isArray(v), 'Array')
        const packer = packerOrSchema as Packer
        v.forEach((e, i) => {
          assertTypeSafe(`${key}[${i}]`, e, packer.typecheck, packer._type)
          packer.pack(e, buf)
        })
      } else {
        // It's an array of schemas
        const v = data[key] as BinpackStruct[]
        const schema = packerOrSchema as Schema<BinpackStruct>
        assertTypeSafe(key, v, () => isArray(v), 'Array<BinpackStruct>')
        v.forEach((e) => _pack(schema, e, buf))
      }
    } else {
      const packerOrSchema = packerOrSchemaOrArray
      if (isPacker(packerOrSchema)) {
        // It's a value
        const packer = packerOrSchema
        const v = data[key] as BinpackValueTypePrimitive
        assertTypeSafe(key, v, packer.typecheck, packer._type)
        packer.pack(v, buf)
      } else {
        // It's a schema
        const v = data[key] as BinpackStruct
        assertTypeSafe(key, v, () => isObject(v), 'BinpackStruct')
        _pack(schema[key] as Schema<BinpackStruct>, v, buf)
      }
    }
  })
  return buf.toBuffer()
}

const _unpack = <TData extends BinpackStruct>(
  schema: Schema<TData>,
  packed: SmartBuffer
): TData => {
  const keys = Object.keys(schema)
  const unpacked: BinpackStruct = {}
  keys.forEach((key) => {
    const unpackerOrSubtreeOrArray = schema[key]
    if (Array.isArray(unpackerOrSubtreeOrArray)) {
      const unpackerOrSchema = unpackerOrSubtreeOrArray[0] as
        | Packer
        | Schema<BinpackStruct>
      const count = packed.readUInt16BE()
      const arr = []
      if (isPacker(unpackerOrSchema)) {
        // It's an array of unpackers
        const unpacker = unpackerOrSchema as Packer
        for (let i = 0; i < count; i++) {
          arr.push(unpacker.unpack(packed))
        }
      } else {
        // It's an array of schemas
        const schema = unpackerOrSchema as Schema<BinpackStruct>
        for (let i = 0; i < count; i++) {
          arr.push(_unpack(schema, packed))
        }
      }
      unpacked[key] = arr
    } else {
      if (unpackerOrSubtreeOrArray._type) {
        const unpacker = unpackerOrSubtreeOrArray as Packer
        unpacked[key] = unpacker.unpack(packed)
      } else {
        unpacked[key] = _unpack(schema[key] as Schema<BinpackStruct>, packed)
      }
    }
  })
  return unpacked as TData
}

export const binpack = <TData extends BinpackStruct>(
  schema: Schema<TData>,
  data: TData
): Buffer => {
  return _pack<TData>(schema, data, new SmartBuffer())
}

export const binunpack = <TData extends BinpackStruct>(
  schema: Schema<TData>,
  packed: Buffer
): TData => {
  return _unpack(schema, SmartBuffer.fromBuffer(packed))
}
