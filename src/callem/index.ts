import { createNanoEvents } from 'nanoevents'

export type CallemData = any
export type CallemUnsubscriber = () => void
export type CallemHandler<TData extends CallemData = object> = (data: TData) => void
export type CallemSubscriber<TData extends CallemData = object> = (
  cb: CallemHandler<TData>
) => CallemUnsubscriber
export type CallemEmitter<TData extends CallemData = object> = (data: TData) => void

export type CallemPair<TData extends CallemData = object> = [
  CallemSubscriber<TData>,
  CallemEmitter<TData>
]

/*
Usage example:

const [on, emit] = callem<string>()

const unsub = on( s=>{
  console.log('got string', s)
})
emit('hello')
unsub() // Unsubscribe, stop listening

*/
export function callem<TData extends CallemData = object>(): CallemPair<TData> {
  const emitter = createNanoEvents()
  return [
    (callback: CallemHandler<TData>): CallemUnsubscriber => {
      const unsub = emitter.on('callem', callback)
      return unsub
    },
    (data: TData) => {
      emitter.emit('callem', data)
    },
  ]
}
