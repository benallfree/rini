import { batch } from 'react-redux'
import { createEngine, createRealtimeStorageProvider, createStore } from '../engine'

const storage = createRealtimeStorageProvider()
const store = createStore()
export const engine = createEngine({
  store,
  storage,
  onDeferredDispatch: (actions) => {
    batch(() => {
      actions.forEach((action) => action())
    })
  },
})
