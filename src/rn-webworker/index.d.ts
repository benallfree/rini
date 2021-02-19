import WebView from 'react-native-webview'
import { Message } from '.'
import { CallemEmitter, CallemSubscriber } from '../callem'

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
