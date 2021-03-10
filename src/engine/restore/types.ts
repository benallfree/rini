import { Bearing } from '../Database'
import { createStore } from './createStore'

export interface Entity extends Bearing {
  id: string
}

export interface NearbyEntity extends Entity {
  time: number
  distance: number
}

export interface NearbyEntitiesById {
  [_: string]: NearbyEntity
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type StoreProvider = ReturnType<typeof createStore>
export type AppStore = StoreProvider['store']
export type RootState = ReturnType<AppStore['getState']>
export type AppActions = StoreProvider['actions']
export type AppDispatch = AppStore['dispatch']
