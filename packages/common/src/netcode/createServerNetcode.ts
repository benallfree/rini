import {
  LoginRequest,
  LoginResponse,
  packResponse,
  unpackLoginRequest,
} from './messages'
import { MessageTypes, MessageWrapper } from './private'
import {
  handleSocketDataEvent,
  onRawMessage,
} from './private/handleSocketDataEvent'

export type ServerMessageSender = (
  msg: Buffer,
  port: number,
  address: string
) => Promise<number>

export type ServerNetcodeConfig = {
  onLogin: (msg: LoginRequest) => Promise<LoginResponse | undefined>
  send: ServerMessageSender
}

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
  const dispatch: {
    [_ in MessageTypes]?: (e: MessageWrapper) => void
  } = {
    [MessageTypes.LoginRequest]: async (e) => {
      const msg = unpackLoginRequest(e)
      const reply = await settings.onLogin(msg)
      if (!reply) return // don't send reply
      const packed = packResponse(e, reply)
      await settings.send(packed, e.port, e.address)
    },
  }

  onRawMessage((e) => {
    console.log('got a message', { e })
    try {
      const d = dispatch[e.type]
      if (!d) {
        throw new Error(`Unhandled message type ${e.type}`)
      }
      d(e)
    } catch (e) {
      console.error(e)
    }
  })

  return {
    onRawMessage,
    handleSocketDataEvent,
  }
}

export type ServerNetcode = ReturnType<typeof createServerNetcode>
