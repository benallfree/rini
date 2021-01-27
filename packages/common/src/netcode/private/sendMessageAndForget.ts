import { ClientMessageSender } from '../createClientNetcode'

export const sendMessageAndForget = async (
  packed: Buffer,
  send: ClientMessageSender
): Promise<void> => {
  send(packed)
}
