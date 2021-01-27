import { ClientMessageSender } from '../index'

export const sendMessageAndForget = async (
  packed: Buffer,
  send: ClientMessageSender
): Promise<void> => {
  send(packed)
}
