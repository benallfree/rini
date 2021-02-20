/// <reference path="index.d.ts"/>

import { callem } from '../callem'
import { ErrorMessage, MessageBase } from './types'

const [onMessage, emitMessage] = callem<MessageBase>()

window.onerror = function (message, url, lineNumber) {
  const msg: ErrorMessage = {
    type: 'error',
    message: message.toString(),
    url: url?.toString(),
    lineNumber,
  }
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
  //save error and send to server for example.
  return true
}

window.addEventListener('unhandledrejection', (event) => {
  const msg: ErrorMessage = {
    type: 'error',
    message: event.reason,
  }
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
})

const _send = (msg: MessageBase) => {
  const payload = JSON.stringify(msg)
  window.ReactNativeWebView.postMessage(payload)
  return payload
}

window.send = (msg) => {
  const payload = _send(msg)
  return payload
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
