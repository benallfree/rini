/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer'
import { createNanoEvents } from 'nanoevents'

export type DataPrimitives = Buffer | string | number
export type EventData = { [_: string]: DataPrimitives }
export type Unsubscribe = () => void
export type EventHandler<TData extends EventData> = (data: TData) => void
export type EventSubscriber<TData extends EventData> = (
  cb: EventHandler<TData>
) => Unsubscribe
export type EventEmitter<TData extends EventData> = (data: TData) => void

export type EventPair<TData extends EventData> = [
  EventSubscriber<TData>,
  EventEmitter<TData>
]

/*
Usage example:

const [on, emit] = event<string>()

const unsub = on( s=>{
  console.log('got string', s)
})
emit('hello')
unsub() // Unsubscribe, stop listening

*/
export function event<TData extends EventData>(): EventPair<TData> {
  const emitter = createNanoEvents()
  return [
    (callback: EventHandler<TData>): Unsubscribe => {
      const unbind = emitter.on('event', callback)
      return unbind
    },
    (data: TData) => {
      emitter.emit('event', data)
    },
  ]
}
