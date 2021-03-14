import { Timeout } from './types'

export type DeferredAction = () => void
export type DeferredActionHandler = (actionList: DeferredAction[]) => void
export type DeferredActionConfig = {
  onExecuteDeferredActions: DeferredActionHandler
}
export type DeferredActionService = (action: DeferredAction) => void
export type DeferredActionServiceFactory = (config: DeferredActionConfig) => DeferredActionService

const DEFERRED_FPS = 60
const DEFERRED_INTERVAL = 1000 / DEFERRED_FPS

export const createDeferredActionService: DeferredActionServiceFactory = (config) => {
  const { onExecuteDeferredActions } = config
  const deferredActions: DeferredAction[] = []
  let tid: Timeout | undefined
  return (action: DeferredAction) => {
    deferredActions.push(action)
    if (tid) return
    tid = setTimeout(() => {
      // const start = +new Date()
      onExecuteDeferredActions(deferredActions)
      // const end = +new Date()
      // console.log(`Took`, end - start, deferred.length)
      deferredActions.length = 0
      tid = undefined
    }, DEFERRED_INTERVAL)
  }
}
