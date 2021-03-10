import { batch } from 'react-redux'
import { createEngine, createRealtimeStorageProvider, createStore } from '../engine'
import { nanoid } from '../nanoid/index.native'

const storage = createRealtimeStorageProvider({ nanoid })
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
