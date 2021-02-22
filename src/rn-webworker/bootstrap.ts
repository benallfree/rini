/// <reference path="index.d.ts"/>

import { serializeError } from 'serialize-error'
import { callem } from '../callem'
import { ErrorMessage, MessageBase } from './types'

const [onMessage, emitMessage] = callem<MessageBase>()

window.addEventListener('error', (e) => {
  const msg: ErrorMessage = {
    type: 'error',
    message: e.message,
    url: e.filename,
    lineNumber: e.lineno,
    colNumber: e.colno,
    error: JSON.parse(serializeError(e.error)),
  }
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
})

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
