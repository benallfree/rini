import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { AvatarSelectionInfo_AtRest, Bearing, EntityId, Profile } from '../storage/Database'
import { DEFAULT_AVATAR_URI } from './DEFAULT_AVATAR'
import { NearbyEntitiesById, NearbyEntity } from './types'
export interface SliceState {
  isReady: boolean
  isOnline: boolean
  player: {
    uid?: string
    profile?: Profile
    position?: Bearing
  }
  profiles: { [_ in EntityId]: Profile }
  nearbyEntitiesById: NearbyEntitiesById
}

export const DEFAULT_PROFILE: Profile = {
  avatar: {
    current: {
      type: 'bottts',
      uri: DEFAULT_AVATAR_URI,
      salt: (+new Date()).toString(),
    },
  },
}

export const createGameSlice = () => {
  const initialState: SliceState = {
    isReady: false,
    isOnline: false,
    player: {},
    profiles: {},
    nearbyEntitiesById: {},
  }

  const slice = createSlice({
    name: 'game',
    initialState,
    reducers: {
      onlineStatusChanged: (state, action: PayloadAction<boolean>) => {
        state.isOnline = action.payload
      },
      engineReady: (state, action: PayloadAction<boolean>) => {
        state.isReady = action.payload
      },
      uidKnown: (state, action: PayloadAction<EntityId>) => {
        state.player.uid = action.payload
      },
      userProfileUpdated: (state, action: PayloadAction<{ id: EntityId; profile: Profile }>) => {
        const { id, profile } = action.payload
        if (state.player.uid === id) {
          state.player.profile = profile
        }
        state.profiles[id] = profile
      },
      primaryAvatarSelected: (
        state,
        action: PayloadAction<{ id: EntityId; avatar: AvatarSelectionInfo_AtRest }>
      ) => {
        const { id, avatar } = action.payload
        const profile = state.profiles[id] || undefined
        if (!profile) return
        console.log('setting avatar in store', { id, avatar })
        profile.avatar.current = avatar
      },
      playerPositionUpdated: (state, action: PayloadAction<Bearing>) => {
        state.player.position = action.payload
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
