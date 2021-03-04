import _getHashesNear from 'geohashes-near'
import Geohash from '../../latlon-geohash'
import { Point } from '../store'
import { HASH_PRECISION_HALF_KM, HASH_PRECISION_HALF_M, SEARCH_RADIUS } from '../store/const'

const hashCache: { [_: string]: string[] } = {}

export const getHashesNear = (p: Point) => {
  const { latitude, longitude } = p
  const hash = Geohash.encode(latitude, longitude, HASH_PRECISION_HALF_M)
  return {
    center: hash.slice(0, HASH_PRECISION_HALF_KM),
    cluster:
      hashCache[hash] ??
      (hashCache[hash] = _getHashesNear(p, HASH_PRECISION_HALF_KM, SEARCH_RADIUS, 'meters')),
  }
}
