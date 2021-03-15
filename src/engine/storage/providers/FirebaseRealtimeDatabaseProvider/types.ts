import { createRealtimeStorageProvider } from './provider'

export type StorageProvider = ReturnType<typeof createRealtimeStorageProvider>
