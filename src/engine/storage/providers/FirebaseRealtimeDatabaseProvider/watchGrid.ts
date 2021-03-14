import { forEach } from '@s-libs/micro-dash'
import firebase from 'firebase'
import { callem } from '../../../../callem'
import { EntityId, NoncedBearing_Read, Point } from '../../Database'
import { getHashesNear } from './getHashesNear'
import { limiter } from './limiter'
interface Watcher {
  count: number
  unsub: () => void
}

interface WatchCollection {
  [_: string]: Watcher
}

export interface EntityUpdatedEvent {
  id: EntityId
  position: NoncedBearing_Read
  gc: () => Promise<void>
}

export const createGridWatcher = () => {
  let totalWatchers = 0
  const watchers: WatchCollection = {}
  const pointCache: { [center: string]: string[] } = {}

  const [onEntityUpdated, fireEntityUpdated] = callem<EntityUpdatedEvent>()

  const handleChildAdded = (snap: firebase.database.DataSnapshot) => {
    const data = snap.val() as NoncedBearing_Read | null
    if (!snap.key) throw new Error(`Snapshot has no key on child added`)
    if (!data) return // No data available
    const id = snap.key
    fireEntityUpdated({ id, position: data, gc: () => limiter.schedule(() => snap.ref.remove()) })
    // console.log('added', { data, snap })
  }
  const handleChildChanged = (snap: firebase.database.DataSnapshot) => {
    const data = snap.val() as NoncedBearing_Read | null
    if (!data) return // data removed // FIXME??
    if (!snap.key) throw new Error(`Snapshot has no key on child added`)
    fireEntityUpdated({
      id: snap.key,
      position: data,
      gc: () => limiter.schedule(() => snap.ref.remove()),
    })
    // console.log('changed', { data }, snap.key)
  }

  const updateWatchGrid = (position: Point, oldCenter?: string) => {
    const { center, cluster } = getHashesNear(position)
    pointCache[center] = cluster
    // console.log(`Cluster size`, cluster.length)

    // watch new hashes
    cluster.forEach((hash) => {
      if (watchers[hash]) {
        watchers[hash].count++
        totalWatchers++
        return
      }
      const path = `grid/${hash}`
      const ref = firebase.database().ref(path)
      const unsub = () => {
        watchers[hash].count--
        totalWatchers--
        if (watchers[hash].count > 0) return
        // console.log(`Unwatching ${path}`)
        ref.off('child_added', handleChildAdded)
        ref.off('child_changed', handleChildChanged)
        // console.log('deleting watcher', hash)
        delete watchers[hash]
      }
      ref.on('child_added', handleChildAdded)
      ref.on('child_changed', handleChildChanged)
      totalWatchers++
      watchers[hash] = {
        count: 1,
        unsub,
      }
    })

    // Stop watching outdated hashes
    if (oldCenter) {
      forEach(pointCache[oldCenter], (hash) => {
        watchers[hash]?.unsub()
      })
    }

    // console.log(`Total watchers: ${totalWatchers}`)
    // console.log(`Total hashes watched: ${keys(watchers).length}`)

    return center
  }

  return { onEntityUpdated, updateWatchGrid }
}
