import { CallemEmitter, CallemSubscriber } from 'callem'
import WebView from 'react-native-webview'

declare global {
  interface Window {
    ready: () => void
    log: (...args: any[]) => void
    send: (msg: Message) => void
    ReactNativeWebView: WebView
    onMessage: CallemSubscriber<Message>
    emitMessage: CallemEmitter<Message>
  }
}

export enum MessageTypes {
  Log = 'log',
  Ping = 'ping',
  Pong = 'pong',
  Error = 'error',
  Ready = 'ready',
}

export interface Message<
  TMessageTypes extends MessageTypes = MessageTypes,
  TData = any
> {
  type: TMessageTypes
  data?: TData
}
