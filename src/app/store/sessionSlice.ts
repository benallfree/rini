import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { XpUpdate } from '../../common'

type Coords = { latitude: number; longitude: number }

interface SessionState {
  idToken?: string
  location?: Coords
  xp?: XpUpdate
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
    xpUpdated: (state, action: PayloadAction<XpUpdate>) => {
      state.xp = action.payload
    },
  },
})

// Action creators are generated for eache case reducer function
export const { idTkenChanged, locationChanged, xpUpdated } = sesionSlice.actions

export default sesionSlice.reducer
