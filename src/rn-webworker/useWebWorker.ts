import React, { useRef, useState } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { callem } from '../callem'
import bootstrapJs from './bootstrap.inlined'
import { MessageBase } from './types'

export const useWebWorker = <TMessageTypes extends MessageBase>(code?: string) => {
  const webviewRef = useRef<WebView>(null)
  const [isReady, setIsReady] = useState(false)

  const [onMessage, fireMessage] = callem<TMessageTypes>()

  const handleMessage = (e: WebViewMessageEvent) => {
    const { data } = e.nativeEvent
    if (data === 'ready') {
      setIsReady(true)
      return
    }

    const message = JSON.parse(data) as MessageBase
    fireMessage(message as TMessageTypes)
  }

  const WebWorker = () =>
    React.createElement(WebView, {
      originWhitelist: ['*'],
      ref: webviewRef,
      injectedJavaScript: `
      ${bootstrapJs};
      ${code};
      `,
      source: { html: '<html><body></body></html>' },
      onMessage: handleMessage,
    })

  const injectJs = (code: string) => {
    if (!isReady) {
      throw new Error(`Attempt to call injectJs before isReady===true`)
    }
    if (!webviewRef.current) {
      throw new Error(`Attempt to call injectJs before <WebWorker/> ref is available`)
    }
    webviewRef.current.injectJavaScript(code)
  }

  const send = (msg: TMessageTypes) => {
    const payload = JSON.stringify(msg)
    const exec = `
      window.emitMessage(${payload});
    `
    injectJs(exec)
  }

  return { WebWorker, send, onMessage, injectJs, isReady }
}
