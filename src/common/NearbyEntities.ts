import { NearbyDC } from 'georedis'

export type NearbyEntity = NearbyDC & {
  awardedAt?: number
}

export type NearbyEntities = {
  nearby: NearbyEntity[]
}
