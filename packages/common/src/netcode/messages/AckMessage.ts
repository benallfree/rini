import { ClientMessageSender } from '..'
import { MessageTypes, MessageWrapper } from '../private'
import { packMessage } from '../private/packMessage'
import { sendMessageAndForget } from '../private/sendMessageAndForget'

export type AckMessage = {
  refMessageId: number
}
export const packAckMessage = (msg: AckMessage): Buffer => {
  return packMessage(MessageTypes.Ack, msg.refMessageId)
}
export const unpackAckMessage = (wrapper: MessageWrapper): AckMessage => {
  const msg: AckMessage = {
    refMessageId: wrapper.refMessageId,
  }
  return msg
}

export const sendAckMessage = async (
  msg: AckMessage,
  send: ClientMessageSender
): Promise<void> => {
  const packed = packAckMessage(msg)
  sendMessageAndForget(packed, send)
}
