import { NearbyDC } from 'georedis'
import { MessageTypes } from '../lib'
import { Binpacker, registerSchema } from '../lib/binpack'

export type NearbyEntities = {
  nearby: NearbyDC[]
}

export const NearbyEntitiesSchema = registerSchema<NearbyEntities>(
  MessageTypes.NearbyEntities,
  {
    nearby: {
      key: Binpacker.String,
      latitude: Binpacker.Float,
      longitude: Binpacker.Float,
      distance: Binpacker.Float,
    },
  }
)
