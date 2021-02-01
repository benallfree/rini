import { NearbyDC } from 'georedis'

export type LoginRequest = {
  idToken: string
}
export type LoginResponse = {
  uid: string
}

export type PositionUpdateRequest = {
  latitude: number
  longitude: number
}

export type NearbyEntities = {
  nearby: NearbyDC[]
}

export type AnyMessage =
  | LoginRequest
  | LoginResponse
  | PositionUpdateRequest
  | NearbyEntities
