import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  detectCollisionFromChangedEntity,
  recalcNearbyEntityDistancesOnChangedLocation,
} from './middleware/detectCollisions'
import { entityUpdateWatcher } from './middleware/entityUpdateWatcher'
import { remoteUpdatePosition } from './middleware/remoteUpdatePosition'
import entitiesReducer, { dropOldEntities } from './slices/entitiesSlice'
import profileReducer from './slices/profileSlice'
import sessionReducer from './slices/sessionSlice'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      session: sessionReducer,
      entities: entitiesReducer,
      profile: profileReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([
        remoteUpdatePosition,
        entityUpdateWatcher,
        detectCollisionFromChangedEntity,
        recalcNearbyEntityDistancesOnChangedLocation,
      ]),
  })
  const gc = () => {
    store.dispatch(dropOldEntities())
    setTimeout(gc, 500)
  }
  gc()
  return store
}

export type Store = ReturnType<typeof makeStore>

export type RootState = ReturnType<Store['getState']>
export type AppDispatch = Store['dispatch']

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
