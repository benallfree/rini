import firebase from 'firebase'
import { db, storage } from '../../../../app/firebase'
import {
  AvatarSelectionInfo_AtRest,
  AvatarSelectionInfo_InMemory,
  Bearing,
  NoncedBearing_Write,
  Profile,
} from '../../Database'
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
    // console.log('sending to db', update)
    return limiter.schedule(() => {
      return db.ref(path).set(update)
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

  const uploadAvatar = async (info: AvatarSelectionInfo_InMemory): Promise<string> => {
    const { id, type, salt, svg } = info
    const path = `avatars/${salt}/${id}/${type}.svg`
    const storageRef = storage.ref(path)
    console.log('storing to ', path, info, typeof svg)
    const snap = await storageRef.put(new Blob([svg], { type: 'image/svg+xml' }))
    console.log(snap.bytesTransferred, snap.metadata)
    const uri = (await storageRef.getDownloadURL()) as string
    console.log('download url is', uri)
    return uri
  }

  const setAvatar = async (
    info: AvatarSelectionInfo_InMemory
  ): Promise<AvatarSelectionInfo_AtRest> => {
    const { id, type, salt, svg } = info
    const uri = await uploadAvatar(info)
    const rec: AvatarSelectionInfo_AtRest = {
      type: info.type,
      salt: info.salt,
      uri,
    }
    const path = `profiles/${id}/avatar/current`
    console.log(`saving at-rest object to ${path}`, rec)
    await db.ref(path).set(rec)
    return rec
  }

  return {
    getProfile,
    setProfile,
    setEntityPosition,
    onEntityUpdated,
    setAvatar,
  }
}
