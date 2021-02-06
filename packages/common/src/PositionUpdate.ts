import { NetcodeTypes, Schema } from 'n37c0d3'

export type PositionUpdate = {
  latitude: number
  longitude: number
}

export const PositionUpdateSchema: Schema<PositionUpdate> = {
  latitude: NetcodeTypes.Float,
  longitude: NetcodeTypes.Float,
}
