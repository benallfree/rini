import { EventEmitter as NodeEventEmitter } from 'events'

export type DataPrimitives = any
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
  const emitter = new NodeEventEmitter()
  return [
    (callback: EventHandler<TData>): Unsubscribe => {
      emitter.on('event', callback)
      return () => emitter.removeListener('event', callback)
    },
    (data: TData) => {
      emitter.emit('event', data)
    },
  ]
}
