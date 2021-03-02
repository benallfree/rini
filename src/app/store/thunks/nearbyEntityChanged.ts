import { getDistance } from 'geolib'
import { AppDispatch, RootState } from '..'
import { collision } from '../slices/profileSlice'
import { Entity } from '../types'

const COLLISION_METERS = 20

export type AppThunk = () => (dispatch: AppDispatch, getState: () => RootState) => void

export const nearbyEntityChanged: AppThunk = (entity: Entity) => (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const state = getState()
  console.log('nearbyEntityChanged', entity)

  const { location } = state.profile
  if (!location) throw new Error(`Must have locaiton when calculating distances`)

  const oldEntity = state.entities.nearby[entity.id]
  console.log('old entity', oldEntity)
  if (oldEntity && entity.time <= oldEntity.time) return

  const distance = getDistance(location, entity)
  // console.log('Recalculating distance from current', location, entity, distance)
  if (distance < COLLISION_METERS) {
    // console.log('collision detected', entity)
    dispatch(collision(entity))
  }

  clearTimeout(state.entities.nearby[entity.id].tid)
  console.log('got here')

  const _tid = setTimeout(() => {
    console.log('gc', entity)
  }, 5000)
  console.log('tid is', _tid)
  return {
    ...entity,
    distance,
    tid: _tid,
  }
}
