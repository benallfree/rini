import { db } from '../../app/firebase'
import { ENTITY_TTL, Point, Timeout } from '../store'
import { Config, limiter, NoncedPointInTime } from './index'
import { createGridWatcher } from './watchGrid'

// hb()
export const createRealtimeStorageProvider = (config: Config) => {
  const { updateWatchGrid, onEntityUpdated } = createGridWatcher()

  const { nanoid } = config
  const setTtl = (() => {
    const ttls: { [_: string]: Timeout } = {}
    return (path: string) => {
      clearTimeout(ttls[path])
      ttls[path] = setTimeout(() => {
        limiter.schedule(() => db.ref(path).remove()).catch((e) => console.error(`Error on ttl`, e))
      }, ENTITY_TTL)
    }
  })()

  let oldCenter: string
  const setPosition = async (uid: string, position: Point) => {
    const { latitude, longitude } = position
    const nonce = await nanoid()

    const hash = updateWatchGrid(position, oldCenter)
    oldCenter = hash

    // Broadcast new position
    const mkpath = (hash: string) => `grid/${hash}/${uid}`
    const path = mkpath(hash)
    // console.log('broadcastLocation', { position, oldCenter, hash, uid, path })
    const update: NoncedPointInTime = {
      latitude,
      longitude,
      time: +new Date(),
      nonce,
    }
    limiter
      .schedule(() => {
        return db.ref(path).set(update)
      })
      .catch((e) => console.error(`Error on setPosition()`, e))
    setTtl(path)
  }

  return {
    setPosition,
    onEntityUpdated,
  }
}
