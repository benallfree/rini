import { NetcodeTypes, Schema } from '../n53'

export type PositionUpdate = {
  latitude: number
  longitude: number
}

export const PositionUpdateSchema: Schema<PositionUpdate> = {
  latitude: NetcodeTypes.Float,
  longitude: NetcodeTypes.Float,
}
