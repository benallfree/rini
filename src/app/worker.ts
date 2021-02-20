/// <reference lib="dom"/>

import { createClientNetcode } from '../client'
import { MessageBase, WorkerMessageTypes } from '../rn-webworker'

const { log } = window

interface LoginMessage extends MessageBase {
  type: 'login'
  idToken: string
}

type AnyMessage = WorkerMessageTypes | LoginMessage

window.onMessage((msg) => {
  const _msg = msg as AnyMessage
  const dispatch: { [_ in AnyMessage['type']]?: () => void } = {}
  const _d = dispatch[_msg.type]
  if (!_d) {
    throw new Error(`Message type ${_msg.type} is not implemented`)
  }
  log('Rx main->worker', { _msg })
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

window.ready()
