import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import Geohash from 'latlon-geohash'
import { XpUpdate } from '../../../common'
import { HASH_PRECISION } from '../const'
import { Entity } from './entitiesSlice'

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

interface CollisionEvent {
  type: 'collision'
  entity: Entity
  time: number
}

interface CollisionEventsByEntityId {
  [_: string]: CollisionEvent
}

type AnyEvent = CollisionEvent

interface ProfileState {
  events: AnyEvent[]
  collisionEventsByEntityId: CollisionEventsByEntityId
  location?: HashedPointInTime
  xp?: XpUpdate
}

// Define the initial state using that type
const initialState: ProfileState = {
  events: [],
  collisionEventsByEntityId: {},
}

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    locationChanged: (state, action: PayloadAction<Point>) => {
      // console.log('updating location', { action })
      const { latitude, longitude } = action.payload
      const hash = Geohash.encode(latitude, longitude, HASH_PRECISION)
      const locData = { ...action.payload, hash, time: +new Date() }
      console.log('locData', locData)
      state.location = locData
    },
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
})

// Action creators are generated for eache case reducer function
export const { locationChanged, xpUpdated, collision } = profileSlice.actions

export default profileSlice.reducer
