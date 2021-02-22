export interface MessageBase<TType extends string = string> {
  type: TType
}

export interface LogMessage extends MessageBase<'log'> {
  data: any[]
}

export interface PingMessage extends MessageBase<'ping'> {
  message: string
}

export interface PongMessage extends MessageBase<'pong'> {
  message: string
}

export interface ErrorMessage extends MessageBase<'error'> {
  message: string
  url?: string
  lineNumber?: number
  colNumber?: number
  error?: Error
}

export interface ReadyMessage extends MessageBase<'ready'> {}

export type WorkerMessageTypes =
  | LogMessage
  | PingMessage
  | PongMessage
  | ErrorMessage
  | ReadyMessage
