/// <reference path="index.d.ts"/>

import { callem } from '../callem'
import { MessageBase } from './types'

const [onMessage, emitMessage] = callem<MessageBase>()

window.onerror = function (message, url, lineNumber) {
  const msg = {
    type: 'error',
    data: { message, url, lineNumber },
  } as MessageBase
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
  //save error and send to server for example.
  return true
}

window.addEventListener('unhandledrejection', (event) => {
  const msg = {
    type: 'error',
    data: event.reason,
  } as MessageBase
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
})

const _send = (msg: MessageBase) => {
  const payload = JSON.stringify(msg)
  window.ReactNativeWebView.postMessage(payload)
  return payload
}

window.send = (msg) => {
  const payload = _send(msg)
}

window.ready = () => {
  const msg = {
    type: 'ready',
  } as MessageBase
  return window.send(msg)
}

window.log = (...args) => {
  const msg = {
    type: 'log',
    data: args,
  } as MessageBase
  return _send(msg)
}

window.emitMessage = emitMessage
window.onMessage = onMessage

window.ReactNativeWebView.postMessage('ready')
