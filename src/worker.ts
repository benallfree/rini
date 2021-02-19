/// <reference lib="dom"/>

import { Message } from './rn-webworker'
const { log } = window

window.onMessage((e) => {
  const msg = e.data as Message
  window.log('Rx main->worker', { msg })
})

var exampleSocket = new WebSocket('ws://localhost:3000')
log('got that socket')

exampleSocket.onopen = (event) => {
  log('onopen')
}

exampleSocket.onerror = (e) => {
  log('got an error', e)
}

exampleSocket.onmessage = (m) => {
  log('got a message', m)
}

window.ready()
