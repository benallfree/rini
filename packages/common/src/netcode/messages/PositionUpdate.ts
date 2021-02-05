import { MessageTypes } from '../lib'
import { Binpacker, registerSchema } from '../lib/binpack'

export type PositionUpdate = {
  latitude: number
  longitude: number
}

export const PositionUpdateSchema = registerSchema(
  MessageTypes.PositionUpdate,
  {
    latitude: Binpacker.Float,
    longitude: Binpacker.Float,
  }
)
