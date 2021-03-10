import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { AvatarSalt, Bearing, EntityId, IdenticonKey, Profile } from '../Database'
import { NearbyEntitiesById, NearbyEntity } from './types'

export interface SliceState {
  isReady: boolean
  uid?: string
  profile: Profile
  position?: Bearing
  nearbyEntitiesById: NearbyEntitiesById
}

export const DEFAULT_PROFILE: Profile = {
  avatar: {
    type: 'bottts',
    salts: {
      avataaars: Math.random().toString(),
      bottts: Math.random().toString(),
      female: Math.random().toString(),
      gridy: Math.random().toString(),
      human: Math.random().toString(),
      identicon: Math.random().toString(),
      male: Math.random().toString(),
    },
  },
}

export const createGameSlice = () => {
  const initialState: SliceState = {
    isReady: false,
    profile: DEFAULT_PROFILE,
    nearbyEntitiesById: {},
  }

  const slice = createSlice({
    name: 'game',
    initialState,
    reducers: {
      engineReady: (state) => {
        state.isReady = true
      },
      uidKnown: (state, action: PayloadAction<EntityId>) => {
        state.uid = action.payload
      },
      userProfileUpdated: (state, action: PayloadAction<Profile>) => {
        state.profile = action.payload
      },
      avatarSaltUpdated: (
        state,
        action: PayloadAction<{ type: IdenticonKey; salt: AvatarSalt }>
      ) => {
        const { type, salt } = action.payload
        state.profile.avatar.salts[type] = salt
      },
      avatarTypeUpdated: (state, action: PayloadAction<IdenticonKey>) => {
        const type = action.payload
        state.profile.avatar.type = type
      },
      playerPositionUpdated: (state, action: PayloadAction<Bearing>) => {
        state.position = action.payload
        forEach(state.nearbyEntitiesById, (e) => {
          e.distance = getDistance(action.payload, e)
        })
      },
      nearbyEntityRemoved: (state, action: PayloadAction<EntityId>) => {
        const id = action.payload
        delete state.nearbyEntitiesById[id]
      },
      nearbyEntityUpdated: (state, action: PayloadAction<NearbyEntity>) => {
        const entity = action.payload
        state.nearbyEntitiesById[entity.id] = entity
      },
      nearbyEntityDistanceChanged: (
        state,
        action: PayloadAction<{ id: EntityId; distance: number }>
      ) => {
        const { id, distance } = action.payload
        const e = state.nearbyEntitiesById[id]
        if (!e) return
        e.distance = distance
      },
    },
  })

  const { actions, reducer } = slice
  return { actions, reducer }
}
