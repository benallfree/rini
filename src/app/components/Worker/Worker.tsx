import React, { FC, useEffect } from 'react'
import { useWebWorker } from '../../../rn-webworker'
import { useAppSelector } from '../../hooks/useAppSelector'
import {
  AnyMessage,
  DispatchHandler,
  DispatchLookup,
  HeartbeatMessage,
  loginMessage,
} from './types'
import workerJs from './worker-app.inlined'

const makeHeartbeatMonitor = (): DispatchHandler<HeartbeatMessage> => {
  const state: {
    tid?: ReturnType<typeof setTimeout>
    start: number
  } = {
    start: +new Date(),
  }
  const timeoutHeartbeat = () => {
    const end = +new Date()
    const delta = end - state.start
    console.error(`Lost heartbeat from worker for ${delta}ms`)
    state.tid = undefined
  }
  const TIMEOUT_MS = 1000
  const gotHeartbeat = () => {
    const { tid } = state
    // console.log('got a heartbeat', { tid })
    clearTimeout(tid)
    if (!tid) {
      // console.log('Restored heartbeat from worker')
    }

    state.start = +new Date()
    state.tid = setTimeout(timeoutHeartbeat, TIMEOUT_MS)
    // console.log('setting tid', tid)
  }
  // state.tid = setTimeout(timeoutHeartbeat, TIMEOUT_MS)
  return gotHeartbeat
}

const dispatch: DispatchLookup = {
  heartbeat: makeHeartbeatMonitor(),
  log: (msg) => {
    msg.data.forEach((line) => {
      console.log(`[Worker] ${JSON.stringify(line)}`)
    })
  },
  ready: (msg) => {},
}

export const Worker: FC = ({ children }) => {
  const idToken = useAppSelector((state) => state.session.idToken)
  const { WebWorker, send, onMessage, isReady } = useWebWorker(workerJs)

  useEffect(() => {
    return onMessage((msg) => {
      const _msg = msg as AnyMessage
      const _d = dispatch[_msg.type as AnyMessage['type']] as DispatchHandler<AnyMessage>
      if (!_d) {
        console.warn(`Warning: unhandled message type from worker: ${JSON.stringify(_msg)}`)
        return
      }
      _d(_msg)
    })
  }, [onMessage])

  useEffect(() => {
    if (!idToken || !isReady) return
    send(loginMessage({ idToken }))
  }, [idToken, send, isReady])

  return <WebWorker />
}
