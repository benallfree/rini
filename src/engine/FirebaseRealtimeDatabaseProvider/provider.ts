import { IdenticonKey } from '../../app/components/Map/Identicon'
import { db } from '../../app/firebase'
import { Bearing, ENTITY_TTL, Profile, Timeout } from '../store'
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
  const setPosition = async (uid: string, position: Bearing) => {
    const { latitude, longitude, heading, speed } = position
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
      heading,
      speed,
    }
    return limiter
      .schedule(() => {
        return db.ref(path).set(update)
      })
      .then(() => setTtl(path))
  }

  const setAvatarSalt = (uid: string, type: IdenticonKey, salt: string) => {
    return limiter.schedule(() => {
      return db.ref(`profiles/${uid}/avatar/salts/${type}`).set(salt)
    })
  }

  const setAvatarType = (uid: string, type: IdenticonKey) => {
    return limiter.schedule(() => {
      return db.ref(`profiles/${uid}/avatar/type`).set(type)
    })
  }

  const getProfile = (uid: string) => {
    return limiter.schedule(() => {
      return db.ref(`profiles`).child(uid).once('value')
    })
  }

  const setProfile = (uid: string, profile: Profile) => {
    return limiter.schedule(() => {
      return db.ref(`profiles/${uid}`).set(profile)
    })
  }

  return {
    getProfile,
    setProfile,
    setAvatarType,
    setAvatarSalt,
    setPosition,
    onEntityUpdated,
  }
}
