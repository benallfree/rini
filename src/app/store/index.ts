import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'
import entitiesReducer from './slices/entitiesSlice'
import profileReducer from './slices/profileSlice'
import sessionReducer from './slices/sessionSlice'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      session: sessionReducer,
      entities: entitiesReducer,
      profile: profileReducer,
    },
  })

  return store
}

export type Store = ReturnType<typeof makeStore>

export type RootState = ReturnType<Store['getState']>
export type AppDispatch = Store['dispatch']

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = () => useStore<RootState>()
