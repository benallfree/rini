import { isDevice } from 'expo-device'
import { checkForUpdateAsync } from 'expo-updates'
import { batch } from 'react-redux'
import { createEngine, createRealtimeStorageProvider, createStore } from '../engine'
import { consoleMiddleware, logger } from '../engine/core/logger'

logger.use(consoleMiddleware)

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
  isUpdateAvailableDelegate: () => {
    if (!isDevice || __DEV__) return Promise.resolve(false)
    return checkForUpdateAsync().then((res) => res.isAvailable)
  },
})
