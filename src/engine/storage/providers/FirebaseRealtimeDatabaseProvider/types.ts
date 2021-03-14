import { nanoid } from '../../../../nanoid'
import { createRealtimeStorageProvider } from './provider'

export interface Config {
  nanoid: typeof nanoid
}

export type StorageProvider = ReturnType<typeof createRealtimeStorageProvider>
