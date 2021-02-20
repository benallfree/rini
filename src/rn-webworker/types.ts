export interface MessageBase {
  type: string
}

export interface LogMessage extends MessageBase {
  type: 'log'
  data: any
}

export interface PingMessage extends MessageBase {
  type: 'ping'
  message: string
}

export interface PongMessage extends MessageBase {
  type: 'pong'
  message: string
}

export interface ErrorMessage extends MessageBase {
  type: 'error'
  message: string
}

export interface ReadyMessage extends MessageBase {
  type: 'ready'
}

export type WorkerMessageTypes =
  | LogMessage
  | PingMessage
  | PongMessage
  | ErrorMessage
  | ReadyMessage
