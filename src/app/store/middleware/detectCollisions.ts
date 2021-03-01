import { Middleware } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { RootState } from '../index'
import { nearbyEntityChanged } from '../slices/entitiesSlice'
import { collision, locationChanged } from '../slices/profileSlice'

export const detectCollisionFromChangedEntity: Middleware = (store) => (next) => (action) => {
  const getState = () => store.getState() as RootState

  const res = next(action)

  if (!nearbyEntityChanged.match(action)) return res

  const state = getState() as RootState

  const entity = state.entities.nearby[action.payload.entity.id]
  if (entity.distance < 5) {
    console.log('collision detected', entity)
    store.dispatch(collision(entity))
  }

  return res
}

export const recalcNearbyEntityDistancesOnChangedLocation: Middleware = (store) => (next) => (
  action
) => {
  const getState = () => store.getState() as RootState

  const res = next(action)

  if (!locationChanged.match(action)) return res

  const state = getState() as RootState

  const { location } = state.profile
  if (!location) return res

  console.log('pulled locationf rom state for recalc', location)

  forEach(state.entities.nearby, (entity) => {
    store.dispatch(nearbyEntityChanged({ currentLocation: { ...location }, entity }))
  })

  return res
}
