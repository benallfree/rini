import { BinpackStruct, Schema } from './binpack'
import { createTransportPacker } from './transport'

export { NetcodeTypes, Schema } from './binpack'
export * from './transport'

export type SchemaLookup = {
  [_ in number]: Schema<BinpackStruct>
}

export const createNetcode = <TSchemaLookups extends SchemaLookup>(
  schemas: TSchemaLookups
) => {
  const transport = createTransportPacker(schemas)

  return transport
}
