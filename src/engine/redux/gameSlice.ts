import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { debug, LogEvent } from '../core/logger'
import { EntityId, Movement } from '../storage/Database'
import { NearbyEntitiesById, NearbyEntity } from './types'

export interface Settings {
  beta: {
    showLocation: boolean
    showDistances: boolean
    isUpdateAvailable: boolean
  }
}
export interface SliceState {
  logs: LogEvent[]
  settings: Settings
  isReady: boolean
  isBeta: boolean
  isOnline: boolean
  player: {
    uid?: string
    movement?: Movement
  }
  nearbyEntitiesById: NearbyEntitiesById
}

export const createGameSlice = () => {
  const initialState: SliceState = {
    logs: [],
    isBeta: false,
    settings: {
      beta: {
        showDistances: false,
        showLocation: false,
        isUpdateAvailable: false,
      },
    },
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
      settingsUpdated: (state, action: PayloadAction<Settings>) => {
        debug('updating settings', action.payload)
        state.settings = action.payload
      },
      updateAvailabilityUpdated: (state, action: PayloadAction<boolean>) => {
        state.settings.beta.isUpdateAvailable = action.payload
      },
      newLogEvent: (state, action: PayloadAction<LogEvent>) => {
        state.logs = [...state.logs.slice(-1000), action.payload]
      },
      clearLogs: (state) => {
        state.logs = []
      },
      permitBetaUser: (state, action: PayloadAction<boolean>) => {
        state.isBeta = action.payload
      },
    },
  })

  const { actions, reducer } = slice
  return { actions, reducer }
}
