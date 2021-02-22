import { createuWebSocketProvider } from './uWebSocket'

export interface Connection {
  id: number
  send: (data: string) => Promise<boolean>
  close: () => Promise<boolean>
}

export interface WsOpenEvent {
  conn: Connection
}

export interface WsCloseEvent {
  conn: Connection
  code: number
  reason: string
}

export interface WsMessageEvent {
  conn: Connection
  data: string
}

export interface WsErrorEvent {
  conn: Connection
  error: Error
}

export type WebSocketProvider = ReturnType<typeof createuWebSocketProvider>
