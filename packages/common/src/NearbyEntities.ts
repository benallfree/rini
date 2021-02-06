import { NearbyDC } from 'georedis'
import { NetcodeTypes, Schema } from 'n37c0d3'

export type NearbyEntities = {
  nearby: NearbyDC[]
}

export const NearbyEntitiesSchema: Schema<NearbyEntities> = {
  nearby: [
    {
      key: NetcodeTypes.String,
      latitude: NetcodeTypes.Float,
      longitude: NetcodeTypes.Float,
      distance: NetcodeTypes.Float,
    },
  ],
}
