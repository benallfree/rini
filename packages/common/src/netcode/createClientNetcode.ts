import { LoginMessage, sendLoginMessage } from './messages'
import {
  handleSocketDataEvent,
  onRawMessage,
} from './private/handleSocketDataEvent'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  send: ClientMessageSender
}

export const createClientNetcode = (settings: ClientNetcodeConfig) => {
  const { send } = settings

  return {
    onRawMessage,
    handleSocketDataEvent,
    sendLoginMessage: (msg: LoginMessage) => sendLoginMessage(msg, send),
  }
}

export type ClientNetcode = ReturnType<typeof createClientNetcode>
