import { MessageWrapper } from '.'
import { ClientMessageSender } from '../index'
import { onRawMessage } from './handleMessage'

export const sendMessageAndAwaitReply = async (
  packed: Buffer,
  send: ClientMessageSender
): Promise<MessageWrapper> => {
  const messageId = packed.readUInt32BE()
  return new Promise<MessageWrapper>((resolve, reject) => {
    const tid = setTimeout(() => {
      reject(`Timed out awaiting reply to ${messageId}`)
    }, 1000)
    const unsub = onRawMessage((m) => {
      if (m.refMessageId !== messageId) return // Skip, it's not our message
      unsub()
      clearTimeout(tid)
      resolve(m)
    })
    send(packed)
  })
}
