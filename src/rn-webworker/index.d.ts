import WebView from 'react-native-webview'
import { MessageBase } from '.'
import { CallemEmitter, CallemSubscriber } from '../callem'

declare global {
  interface Window {
    ready: () => void
    log: (...args: any[]) => void
    send: (msg: MessageBase) => void
    ReactNativeWebView: WebView
    onMessage: CallemSubscriber<MessageBase>
    emitMessage: CallemEmitter<MessageBase>
  }
}
