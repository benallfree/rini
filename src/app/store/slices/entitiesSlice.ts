import { createSlice } from '@reduxjs/toolkit'
import { reduce } from '@s-libs/micro-dash'
import { nearbyEntitiesChanged } from '../thunks/nearbyEntitiesChanged'
import { nearbyEntityChanged } from '../thunks/nearbyEntityChanged'
import { EntitiesState, NearbyEntitiesById } from '../types'

// Define the initial state using that type
const initialState: EntitiesState = { nearby: {} }

export const entitiesSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    dropOldEntities: (state) => {
      const expiry = +new Date() - 1000
      const nearby = reduce(
        state.nearby,
        (c, e, k) => {
          if (e.time < expiry) return c
          c[k] = e
          return c
        },
        {} as NearbyEntitiesById
      )

      state.nearby = nearby
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(nearbyEntityChanged.fulfilled, (state, action) => {
        const entity = action.payload
        if (!entity) return
        state.nearby[entity.id] = entity
      })
      .addCase(nearbyEntitiesChanged.fulfilled, (state, action) => {})
  },
})

// Action creators are generated for eache case reducer function
export const { dropOldEntities } = entitiesSlice.actions

export default entitiesSlice.reducer
