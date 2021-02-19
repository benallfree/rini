/// <reference path="index.d.ts"/>

import { callem } from '../callem'
import { Message, MessageTypes } from './types'

const [onMessage, emitMessage] = callem<Message>()

window.onerror = function (message, url, lineNumber) {
  const msg = {
    type: MessageTypes.Error,
    data: { message, url, lineNumber },
  } as Message
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
  //save error and send to server for example.
  return true
}

window.addEventListener('unhandledrejection', (event) => {
  const msg = {
    type: MessageTypes.Error,
    data: event.reason,
  } as Message
  window.ReactNativeWebView.postMessage(JSON.stringify(msg))
})

const _send = (msg: Message) => {
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
  } as Message
  return window.send(msg)
}

window.log = (...args) => {
  const msg = {
    type: 'log',
    data: args,
  } as Message
  return _send(msg)
}

window.emitMessage = emitMessage
window.onMessage = onMessage

window.ReactNativeWebView.postMessage('ready')
