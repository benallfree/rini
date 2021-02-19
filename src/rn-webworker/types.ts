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
