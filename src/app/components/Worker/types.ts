import {
  ErrorMessage,
  LogMessage,
  MessageBase,
  PingMessage,
  PongMessage,
  ReadyMessage,
  WorkerMessageTypes,
} from '../../../rn-webworker'

export interface LoginMessageDetails {
  idToken: string
}
export type LoginMessage = MessageBase<'login'> & LoginMessageDetails
export const loginMessage = (details: LoginMessageDetails): LoginMessage => ({
  type: 'login',
  ...details,
})

export interface HeartbeatMessage extends MessageBase<'heartbeat'> {}
export const heartbeatMessage = (): HeartbeatMessage => ({ type: 'heartbeat' })

export type AnyMessage = WorkerMessageTypes | LoginMessage | HeartbeatMessage

export type DispatchHandler<TMessage> = (msg: TMessage) => void
export type DispatchLookup = {
  log?: DispatchHandler<LogMessage>
  login?: DispatchHandler<LoginMessage>
  heartbeat?: DispatchHandler<HeartbeatMessage>
  ping?: DispatchHandler<PingMessage>
  pong?: DispatchHandler<PongMessage>
  error?: DispatchHandler<ErrorMessage>
  ready?: DispatchHandler<ReadyMessage>
}
