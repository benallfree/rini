import { Buffer } from 'buffer'
import {
  LoginMessage,
  LoginReply,
  packLoginReply,
  sendLoginMessage,
  unpackLoginMessage,
} from './messages'
import { MessageTypes, MessageWrapper } from './private'
import { handleMessage, onRawMessage } from './private/handleMessage'

/* eslint-disable @typescript-eslint/no-var-requires */
export * from './messages'
export { onRawMessage }
export { MessageTypes }

export type ClientMessageSender = (msg: Buffer) => Promise<void>

type ClientNetcodeConfig = {
  send: ClientMessageSender
}

export const createClientNetcode = (settings: ClientNetcodeConfig) => {
  const { send } = settings

  return {
    onRawMessage,
    handleMessage,
    sendLoginMessage: (msg: LoginMessage) => sendLoginMessage(msg, send),
  }
}

export type ServerMessageSender = (
  msg: Buffer,
  port: number,
  address: string
) => Promise<number>

export type ServerNetcodeConfig = {
  onLogin: (msg: LoginMessage) => Promise<LoginReply | undefined>
  send: ServerMessageSender
}

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
  const dispatch: { [_ in MessageTypes]: (e: MessageWrapper) => void } = {
    [MessageTypes.Login]: async (e) => {
      const msg = unpackLoginMessage(e)
      const reply = await settings.onLogin(msg)
      if (!reply) return // don't send reply
      const packed = packLoginReply(e, reply)
      await settings.send(packed, e.port, e.address)
    },
    [MessageTypes.Ack]: () => {
      return
    }, // Noop
  }

  onRawMessage((e) => {
    console.log('got a message', { e })
    try {
      dispatch[e.type](e)
    } catch (e) {
      console.error(e)
    }
  })

  return {
    onRawMessage,
    handleMessage,
  }
}
