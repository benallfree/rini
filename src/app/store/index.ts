import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { entityUpdateWatcher } from './middleware/entityUpdateWatcher'
import { remoteUpdatePosition } from './middleware/remoteUpdatePosition'
import entitiesReducer, { dropOldEntities } from './slices/entitiesSlice'
import sessionReducer from './slices/sessionSlice'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      session: sessionReducer,
      entities: entitiesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([remoteUpdatePosition, entityUpdateWatcher]),
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
