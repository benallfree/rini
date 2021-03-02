import { createSlice } from '@reduxjs/toolkit'
import { nearbyEntitiesChanged } from '../thunks/nearbyEntitiesChanged'
import { nearbyEntityChanged } from '../thunks/nearbyEntityChanged'
import { EntitiesState } from '../types'

// Define the initial state using that type
const initialState: EntitiesState = { nearby: {} }

export const entitiesSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(nearbyEntityChanged.fulfilled, (state, action) => {
        const entity = action.payload
        console.log('got entity', entity)
        if (!entity) return
        state.nearby[entity.id] = entity
      })
      .addCase(nearbyEntitiesChanged.fulfilled, (state, action) => {})
  },
})

// Action creators are generated for eache case reducer function
// export const {} = entitiesSlice.actions

export default entitiesSlice.reducer
