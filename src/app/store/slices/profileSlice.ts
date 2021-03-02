import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { XpUpdate } from '../../../common'
import { locationChanged } from '../thunks/locationChanged'
import { CollisionEvent, Entity, ProfileState } from '../types'

// Define the initial state using that type
const initialState: ProfileState = {
  events: [],
  collisionEventsByEntityId: {},
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    collision: (state, action: PayloadAction<Entity>) => {
      const entity = action.payload
      if (state.collisionEventsByEntityId[entity.id]) return
      const event: CollisionEvent = { type: 'collision', entity, time: +new Date() }
      state.collisionEventsByEntityId[entity.id] = event
      state.events.unshift(event)
    },
    xpUpdated: (state, action: PayloadAction<XpUpdate>) => {
      state.xp = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(locationChanged.fulfilled, (state, action) => {
      state.location = action.payload
    })
  },
})

// Action creators are generated for eache case reducer function
export const { xpUpdated, collision } = profileSlice.actions

export default profileSlice.reducer
