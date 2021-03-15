import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { EntityId, Movement } from '../storage/Database'
import { NearbyEntitiesById, NearbyEntity } from './types'
export interface SliceState {
  isReady: boolean
  isOnline: boolean
  player: {
    uid?: string
    movement?: Movement
  }
  nearbyEntitiesById: NearbyEntitiesById
}

export const createGameSlice = () => {
  const initialState: SliceState = {
    isReady: false,
    isOnline: false,
    player: {},
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

      playerMovementUpdated: (state, action: PayloadAction<Movement>) => {
        state.player.movement = action.payload
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
