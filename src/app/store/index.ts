import { configureStore } from '@reduxjs/toolkit'
import entitiesReducer from './entitiesSlice'
import sessionReducer from './sessionSlice'

export * from './hooks'
export { store }

const store = configureStore({
  reducer: {
    session: sessionReducer,
    entities: entitiesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
