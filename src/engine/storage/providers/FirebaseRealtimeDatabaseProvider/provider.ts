import firebase from 'firebase'
import { db } from '../../../../app/firebase'
import { Movement, Movement_Write } from '../../Database'
import { limiter } from './limiter'
import { createGridWatcher } from './watchGrid'

// hb()
export const createRealtimeStorageProvider = () => {
  const { updateWatchGrid, onGridEntityUpdated } = createGridWatcher()

  let oldCenter: string
  const setEntityMovement = async (uid: string, movement: Movement) => {
    const { latitude, longitude, heading, speed } = movement

    const hash = updateWatchGrid(movement, oldCenter)
    oldCenter = hash

    // Broadcast new position
    const mkpath = (hash: string) => `grid/${hash}/${uid}`
    const path = mkpath(hash)
    // console.log('broadcastLocation', { position, oldCenter, hash, uid, path })
    const update: Movement_Write = {
      latitude,
      longitude,
      time: firebase.database.ServerValue.TIMESTAMP,
      heading,
      speed,
    }
    // console.log('sending to db', path)
    // console.log(JSON.stringify(update, null, 2))
    return limiter.schedule(() => {
      return db.ref(path).set(update)
    })
  }

  return {
    setEntityMovement,
    onGridEntityUpdated,
  }
}
