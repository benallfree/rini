import { Timeout } from '../createEngine'

export type DeferredAction = () => void
export type DeferredDispatchHandler = (actionList: DeferredAction[]) => void
export type DeferredDispatchConfig = {
  onDeferredDispatch: DeferredDispatchHandler
}
export type DeferredDispatch = (action: DeferredAction) => void
export type DeferredDispatchServiceFactory = (config: DeferredDispatchConfig) => DeferredDispatch

const DEFERRED_FPS = 60
const DEFERRED_INTERVAL = 1000 / DEFERRED_FPS

export const makeDeferredDispatch: DeferredDispatchServiceFactory = (config) => {
  const { onDeferredDispatch } = config
  const deferred: DeferredAction[] = []
  let tid: Timeout | undefined
  return (action: DeferredAction) => {
    deferred.push(action)
    if (tid) return
    tid = setTimeout(() => {
      // const start = +new Date()
      onDeferredDispatch(deferred)
      // const end = +new Date()
      // console.log(`Took`, end - start, deferred.length)
      deferred.length = 0
      tid = undefined
    }, DEFERRED_INTERVAL)
  }
}
