/// <reference lib="dom"/>
/// <reference path="../../../rn-webworker/index.d.ts"/>

import { createClientNetcode } from '../../../client'
import { AnyMessage, DispatchHandler, DispatchLookup, heartbeatMessage } from './types'

const { log } = window

const heartbeat = () => {
  window.send(heartbeatMessage())
  setTimeout(heartbeat, 500)
}
heartbeat()

window.onMessage((msg) => {
  const _msg = msg as AnyMessage
  log('Rx main->worker', { _msg })

  const dispatch: DispatchLookup = {}
  const _d = dispatch[_msg.type as AnyMessage['type']] as DispatchHandler<AnyMessage>
  if (!_d) {
    throw new Error(`Message type ${_msg.type} is not implemented`)
  }
  _d(_msg)
})

const client = createClientNetcode({
  logger: {
    info: log,
    debug: log,
    error: log,
    warn: log,
  },
})

// var exampleSocket = new WebSocket('ws://localhost:3000')
// log('got that socket')

// exampleSocket.onopen = (event) => {
//   log('onopen')
//   exampleSocket.send('hello world')
// }

// exampleSocket.onerror = (e) => {
//   log('onerror', e)
// }

// exampleSocket.onmessage = (m) => {
//   log('onmessage', m)
// }

// exampleSocket.onclose = () => {
//   log('onclose')
// }
