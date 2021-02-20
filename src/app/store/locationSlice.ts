import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Coords = { latitude: number; longitude: number }
interface LocationState {
  current?: Coords
}

// Define the initial state using that type
const initialState: LocationState = {}

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    positionChanged: (state, action: PayloadAction<Coords>) => {
      state.current = action.payload
    },
  },
})

// Action creators are generated for eache case reducer function
export const { positionChanged } = locationSlice.actions

export default locationSlice.reducer
