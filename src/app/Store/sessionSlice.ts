import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Coords = { latitude: number; longitude: number }

interface SessionState {
  idToken?: string
  location?: Coords
}

// Define the initial state using that type
const initialState: SessionState = {}

export const sesionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    idTkenChanged: (state, action: PayloadAction<string | undefined>) => {
      state.idToken = action.payload
    },
    locationChanged: (state, action: PayloadAction<Coords | undefined>) => {
      state.location = action.payload
    },
  },
})

// Action creators are generated for eache case reducer function
export const { idTkenChanged, locationChanged } = sesionSlice.actions

export default sesionSlice.reducer
