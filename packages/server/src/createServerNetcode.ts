import {
  createMessageHandler,
  LoginRequest,
  LoginResponse,
  MessageTypes,
  MessageWrapper,
  packLoginResponse,
  PositionUpdateRequest,
  unpackLoginRequest,
  unpackPositionUpdateRequest,
} from '@rini/common'
import { createServer } from 'net'

export type ServerMessageSender = (msg: Buffer) => Promise<number>

export type ServerNetcodeConfig = {
  onLogin: (
    connId: number,
    msg: LoginRequest
  ) => Promise<LoginResponse | undefined>
  onPositionUpdate: (
    connId: number,
    msg: PositionUpdateRequest
  ) => Promise<void>
}

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
  let connId = 0
  const authenticated: { [_: number]: string | undefined } = {}

  const server = createServer((sock) => {
    connId++
    console.log(`C${connId}: connect`)

    const dispatch: {
      [_ in MessageTypes]?: (e: MessageWrapper) => void
    } = {
      [MessageTypes.LoginRequest]: async (e) => {
        const msg = unpackLoginRequest(e)
        const reply = await settings.onLogin(connId, msg)
        authenticated[connId] = reply?.uid
        if (!reply) return // don't send reply
        const packed = packLoginResponse(e, reply)
        sock.write(packed)
      },
      [MessageTypes.PositionUpdateRequest]: async (e) => {
        const msg = unpackPositionUpdateRequest(e)
        settings.onPositionUpdate(connId, msg)
      },
    }

    const { onRawMessage, handleSocketDataEvent } = createMessageHandler()
    onRawMessage((e) => {
      try {
        if (e.type != MessageTypes.LoginRequest && !authenticated[connId])
          return // Silently ignore unauthenticated
        const d = dispatch[e.type]
        if (!d) {
          throw new Error(`Unhandled message type ${e.type}`)
        }
        d(e)
      } catch (e) {
        console.error(e)
      }
    })

    sock.on('close', (hadError) =>
      console.log(`C${connId}: close`, { hadError })
    )
    sock.on('connect', () => console.log(`C${connId}: connect`))
    sock.on('data', handleSocketDataEvent)
    sock.on('drain', () => console.log(`C${connId}: drain`))
    sock.on('end', () => console.log(`C${connId}: end`))
    sock.on('error', (err) => console.error(`C${connId}: error`, err))
    sock.on('lookup', (err, address, family, host) =>
      console.log(`C${connId}: lookup`, { err, address, family, host })
    )
    sock.on('timeout', () => console.log(`C${connId}: timeout`))
  })
  server.listen(41234, () => {
    console.log(`Server is now listening`)
  })
  server.on('close', () => console.log('main:close'))
  server.on('error', (err: Error) => console.error(`main:`, err))
  server.on('listening', () => console.log('main:listening'))

  return {}
}

export type ServerNetcode = ReturnType<typeof createServerNetcode>
