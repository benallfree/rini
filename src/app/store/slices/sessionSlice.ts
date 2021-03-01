import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Geohash from 'latlon-geohash'
import { XpUpdate } from '../../../common'

export interface Coords {
  latitude: number
  longitude: number
}

interface SessionState {
  idToken?: string
  location?: Coords & { hash: string }
  xp?: XpUpdate
}

const HASH_PRECISION = 5

// Define the initial state using that type
const initialState: SessionState = {}

export const sesionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    idTkenChanged: (state, action: PayloadAction<string | undefined>) => {
      console.log('updating idToken', { action })
      state.idToken = action.payload
    },
    locationChanged: (state, action: PayloadAction<Coords>) => {
      console.log('updating location', { action })
      const { latitude, longitude } = action.payload
      const hash = Geohash.encode(latitude, longitude, HASH_PRECISION)
      state.location = { ...action.payload, hash }
    },
    xpUpdated: (state, action: PayloadAction<XpUpdate>) => {
      state.xp = action.payload
    },
  },
})

// Action creators are generated for eache case reducer function
export const { idTkenChanged, locationChanged, xpUpdated } = sesionSlice.actions

export default sesionSlice.reducer
