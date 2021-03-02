import { createAsyncThunk } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { PointsByEntityId } from '../types'
import { nearbyEntityChanged } from './nearbyEntityChanged'
import { getState } from './util'

export const nearbyEntitiesChanged = createAsyncThunk(
  'nearbyEntitiesChanged',
  (updatedEntities: PointsByEntityId, thunkApi) => {
    const state = getState(thunkApi)

    const { location } = state.profile
    if (!location) throw new Error(`Location must be defined here`)

    forEach(updatedEntities, (entity, id) => {
      thunkApi.dispatch(nearbyEntityChanged({ ...entity, id }))
    })
  }
)
