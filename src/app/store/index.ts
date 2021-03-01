import { configureStore } from '@reduxjs/toolkit'
import entitiesReducer from './slices/entitiesSlice'
import sessionReducer from './slices/sessionSlice'

export * from './hooks'
export { store }
export { dispatch }

const store = configureStore({
  reducer: {
    session: sessionReducer,
    entities: entitiesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const { dispatch } = store
