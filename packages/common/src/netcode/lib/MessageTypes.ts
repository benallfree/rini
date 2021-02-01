import { AnyMessage } from '../messages'

export enum MessageTypes {
  LoginRequest,
  LoginReply,
  PositionUpdate,
  NearbyEntities,
}

export type MessageWrapper<TMessage extends AnyMessage> = {
  type: MessageTypes
  refId?: number
  message: TMessage
}

export type CertifiedMessage<
  TMessage extends AnyMessage
> = MessageWrapper<TMessage> & { id: number }
