import { createAsyncThunk } from '@reduxjs/toolkit'
import { getDistance } from 'geolib'
import { collision } from '../slices/profileSlice'
import { getState } from '../thunks/util'
import { Entity } from '../types'

export const nearbyEntityChanged = createAsyncThunk(
  'nearbyEntityChanged',
  (entity: Entity, thunkApi) => {
    const state = getState(thunkApi)
    // console.log('nearbyEntityChanged', entity)

    const { location } = state.profile
    if (!location) throw new Error(`Must have locaiton when calculating distances`)

    const oldEntity = state.entities.nearby[entity.id]
    if (oldEntity && entity.time <= oldEntity.time) return

    const distance = getDistance(location, entity)
    // console.log('Recalculating distance from current', location, entity, distance)
    if (distance < 5) {
      // console.log('collision detected', entity)
      thunkApi.dispatch(collision(entity))
    }

    return {
      ...entity,
      distance,
    }
  }
)
