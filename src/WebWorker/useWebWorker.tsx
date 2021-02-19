import { callem } from 'callem'
import React, { useMemo, useRef, useState } from 'react'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import bootstrapJs from './bootstrap.inlined'
import { Message, MessageTypes } from './types'

export const useWebWorker = <TMessageTypes extends MessageTypes = MessageTypes>(
  code?: string
) => {
  const webviewRef = useRef<WebView>(null)
  const [isReady, setIsReady] = useState(false)

  const [onMessage, fireMessage] = callem<Message<TMessageTypes>>()

  const handleMessage = (e: WebViewMessageEvent) => {
    const { data } = e.nativeEvent
    if (data === 'ready') {
      setIsReady(true)
      return
    }

    const message = JSON.parse(data) as Message<TMessageTypes>
    fireMessage(message)
  }

  const WebWorker = useMemo(
    () => () => (
      <WebView
        originWhitelist={['*']}
        ref={webviewRef}
        injectedJavaScript={`
        ${bootstrapJs};
        ${code};
        `}
        source={{ html: '<html><body></body></html>' }}
        onMessage={handleMessage}
      />
    ),
    []
  )

  const injectJs = (code: string) => {
    if (!isReady) {
      throw new Error(`Attempt to call injectJs before isReady===true`)
    }
    if (!webviewRef.current) {
      throw new Error(
        `Attempt to call injectJs before <WebWorker/> ref is available`
      )
    }
    webviewRef.current.injectJavaScript(code)
  }

  const send = (msg: Message<TMessageTypes>) => {
    const payload = JSON.stringify(msg)
    const exec = `
      window.emitMessage(${payload});
    `
    injectJs(exec)
  }

  return { WebWorker, send, onMessage, injectJs, isReady }
}
