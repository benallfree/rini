import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Geohash from 'latlon-geohash'
import { XpUpdate } from '../../../common'

export interface Point {
  latitude: number
  longitude: number
}

export interface PointInTime extends Point {
  time: number
}

export interface HashedPointInTime extends PointInTime {
  hash: string
}

interface SessionTokens {
  idToken: string
  uid: string
}
interface SessionState {
  tokens: Partial<SessionTokens>
  location?: HashedPointInTime
  xp?: XpUpdate
}

const HASH_PRECISION = 5

// Define the initial state using that type
const initialState: SessionState = {
  tokens: {},
}

export const sesionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<SessionTokens>) => {
      console.log('updating session tokens', { action })
      state.tokens = action.payload
    },
    locationChanged: (state, action: PayloadAction<Point>) => {
      console.log('updating location', { action })
      const { latitude, longitude } = action.payload
      const hash = Geohash.encode(latitude, longitude, HASH_PRECISION)
      state.location = { ...action.payload, hash, time: +new Date() }
    },
    xpUpdated: (state, action: PayloadAction<XpUpdate>) => {
      state.xp = action.payload
    },
  },
})

// Action creators are generated for eache case reducer function
export const { login, locationChanged, xpUpdated } = sesionSlice.actions

export default sesionSlice.reducer
