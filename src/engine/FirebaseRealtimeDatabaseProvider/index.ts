import Bottleneck from 'bottleneck'
import { nanoid } from '../../nanoid'
import { Bearing } from '../store'
import { createRealtimeStorageProvider } from './provider'

export interface NoncedPointInTime extends Bearing {
  nonce: string
}

export interface Config {
  nanoid: typeof nanoid
}

export const limiter = new Bottleneck({
  maxConcurrent: 100,
  highWater: 1000,
  strategy: Bottleneck.strategy.LEAK,
})

const hb = () => {
  console.log(`Queue depth`, limiter.queued())
  setTimeout(hb, 1000)
}
export type StorageProvider = ReturnType<typeof createRealtimeStorageProvider>
