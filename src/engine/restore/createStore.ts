import { configureStore } from '@reduxjs/toolkit'
import { createGameSlice } from './gameSlice'

export const createStore = () => {
  const gameSlice = createGameSlice()
  const store = configureStore({
    reducer: {
      game: gameSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: false,
        serializableCheck: false,
      }),
  })

  const dispatch = store.dispatch.bind(store)
  const getState = store.getState.bind(store)
  const subscribe = store.subscribe.bind(store)

  return {
    store,
    subscribe,
    dispatch,
    getState,
    actions: {
      ...gameSlice.actions,
    },
  }
}
