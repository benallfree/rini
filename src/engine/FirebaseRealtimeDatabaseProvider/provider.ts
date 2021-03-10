import firebase from 'firebase'
import { IdenticonKey } from '../../app/components/Map/Identicon'
import { db } from '../../app/firebase'
import { Bearing, NoncedBearing_Write, Profile } from '../Database'
import { limiter } from './limiter'
import { Config } from './types'
import { createGridWatcher } from './watchGrid'

// hb()
export const createRealtimeStorageProvider = (config: Config) => {
  const { updateWatchGrid, onEntityUpdated } = createGridWatcher()

  const { nanoid } = config

  let oldCenter: string
  const setEntityPosition = async (uid: string, position: Bearing) => {
    const { latitude, longitude, heading, speed } = position
    const nonce = await nanoid()

    const hash = updateWatchGrid(position, oldCenter)
    oldCenter = hash

    // Broadcast new position
    const mkpath = (hash: string) => `grid/${hash}/${uid}`
    const path = mkpath(hash)
    // console.log('broadcastLocation', { position, oldCenter, hash, uid, path })
    const update: NoncedBearing_Write = {
      latitude,
      longitude,
      time: firebase.database.ServerValue.TIMESTAMP,
      nonce,
      heading,
      speed,
    }
    return limiter.schedule(() => {
      return db.ref(path).set(update)
    })
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
      return db
        .ref(`profiles`)
        .child(uid)
        .once('value')
        .then((snap) => snap.val() as Profile | null)
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
    setEntityPosition,
    onEntityUpdated,
  }
}
