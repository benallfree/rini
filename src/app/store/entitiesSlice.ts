import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NearbyDC } from 'georedis'

interface EntitiesState {
  nearby?: NearbyDC[]
}

// Define the initial state using that type
const initialState: EntitiesState = {}

export const entitiesSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    nearbyEntitiesChanged: (state, action: PayloadAction<NearbyDC[]>) => {
      state.nearby = [...action.payload]
    },
  },
})

// Action creators are generated for eache case reducer function
export const { nearbyEntitiesChanged } = entitiesSlice.actions

export default entitiesSlice.reducer
