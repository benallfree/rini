import WebView from 'react-native-webview'
import { CallemEmitter, CallemSubscriber } from '../../callem'
import { Message } from '../../rn-webworker'

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
