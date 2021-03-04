import { forEach } from '@s-libs/micro-dash'
import firebase from 'firebase'
import { limiter } from '.'
import { callem } from '../../callem'
import { Entity, ENTITY_TTL, Point, PointInTime } from '../store'
import { getHashesNear } from './getHashesNear'
interface Watcher {
  count: number
  unsub: () => void
}

interface WatchCollection {
  [_: string]: Watcher
}

export const createGridWatcher = () => {
  let totalWatchers = 0
  const watchers: WatchCollection = {}
  const pointCache: { [center: string]: string[] } = {}

  const [onEntityUpdated, fireEntityUpdated] = callem<Entity>()

  const handleChildAdded = (snap: firebase.database.DataSnapshot) => {
    const data = snap.val() as PointInTime
    if (!snap.key) throw new Error(`Snapshot has no key on child added`)
    const id = snap.key
    const age = +new Date() - data.time
    if (age > ENTITY_TTL) {
      limiter
        .schedule({ priority: 9 }, () => snap.ref.remove())
        .catch((e) => console.error('cooperative gc error', e))
    } else {
      fireEntityUpdated({ ...data, id })
    }
    // console.log('added', { data, snap })
  }
  const handleChildChanged = (snap: firebase.database.DataSnapshot) => {
    const data = snap.val() as PointInTime
    if (!snap.key) throw new Error(`Snapshot has no key on child added`)
    fireEntityUpdated({ ...data, id: snap.key })
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
