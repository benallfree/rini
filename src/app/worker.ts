/// <reference lib="dom"/>

import { createClientNetcode } from '../client'
import {
  ErrorMessage,
  LogMessage,
  MessageBase,
  PingMessage,
  PongMessage,
  ReadyMessage,
  WorkerMessageTypes,
} from '../rn-webworker'

const { log } = window

export interface LoginMessage extends MessageBase<'login'> {
  idToken: string
}

export interface HeartbeatMessage extends MessageBase<'heartbeat'> {}

export type AnyMessage = WorkerMessageTypes | LoginMessage | HeartbeatMessage

const heartbeat = () => {
  window.send({ type: 'heartbeat' })
  setTimeout(heartbeat, 500)
}
heartbeat()

export type DispatchHandler<TMessage> = (msg: TMessage) => void
export type DispatchLookup = {
  log?: DispatchHandler<LogMessage>
  login?: DispatchHandler<LoginMessage>
  heartbeat?: DispatchHandler<HeartbeatMessage>
  ping?: DispatchHandler<PingMessage>
  pong?: DispatchHandler<PongMessage>
  error?: DispatchHandler<ErrorMessage>
  ready?: DispatchHandler<ReadyMessage>
}

window.onMessage((msg) => {
  const _msg = msg as AnyMessage
  const dispatch: DispatchLookup = {}
  const _d = dispatch[
    _msg.type as AnyMessage['type']
  ] as DispatchHandler<AnyMessage>
  if (!_d) {
    throw new Error(`Message type ${_msg.type} is not implemented`)
  }
  _d(_msg)
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
