import { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-native'
import { NearbyEntity, Setter } from '../engine/store'
import { engine } from './engine'

const batchCalls: (() => void)[] = []

const defer = (cb: Setter<any>) => (e: any) => {
  batchCalls.push(() => cb(e))
}

const render = () => {
  unstable_batchedUpdates(() => {
    batchCalls.forEach((b) => b())
    batchCalls.length = 0
  })
  setTimeout(render, 15)
}
render()

export const useNearbyEntityIds = () => {
  const [entityIds, setEntityIds] = useState<string[]>([])
  useEffect(() => {
    return engine.watchNearbyEntityIds(defer(setEntityIds))
  }, [])
  return entityIds
}

export const useNearbyEntityPosition = (id: string) => {
  const [entity, setEntity] = useState<NearbyEntity>()
  useEffect(() => {
    return engine.watchNearbyEntityPosition(id, defer(setEntity))
  }, [id])
  return entity
}

export const usePlayerPosition = () => {
  const [position, setPosition] = useState(engine.select((state) => state.position))
  useEffect(() => {
    return engine.watchPlayerPosition(defer(setPosition))
  }, [])

  return position
}

export const useHasPlayerPosition = () => {
  const [hasPosition, setHasPosition] = useState(engine.select((state) => !!state.position))
  useEffect(() => {
    return engine.watchPlayerPosition((bearing) => defer(() => setHasPosition(!!bearing)))
  }, [])

  return hasPosition
}
