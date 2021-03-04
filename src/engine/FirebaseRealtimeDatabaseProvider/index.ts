import Bottleneck from 'bottleneck'
import { db } from '../../app/firebase'
import { nanoid } from '../../nanoid'
import { ENTITY_TTL, Point, PointInTime, Timeout } from '../store'
import { createGridWatcher } from './watchGrid'

interface NoncedPointInTime extends PointInTime {
  nonce: string
}

interface Config {
  nanoid: typeof nanoid
}

export const limiter = new Bottleneck({
  maxConcurrent: 100,
  highWater: 1000,
  strategy: Bottleneck.strategy.LEAK,
})

const hb = () => {
  console.log(`Queue depth`, limiter.queued())
  setTimeout(hb, 1000)
}
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

export type StorageProvider = ReturnType<typeof createRealtimeStorageProvider>
