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

  let openConnectionCount = 0
  let pingCount = 0
  let startTimeMs = +new Date()
  const heartbeat = () => {
    const endTimeMs = +new Date()
    const totalMs = endTimeMs - startTimeMs
    const pingsPerSec = pingCount / (totalMs / 1000)
    const pingsExpectedPerSec = openConnectionCount * 2
    const missedPingsPerSec = Math.max(0, pingsExpectedPerSec - pingsPerSec)

    const pressure = pingsExpectedPerSec
      ? missedPingsPerSec / pingsExpectedPerSec
      : 0
    console.log({
      openConnectionCount,
      startTimeMs,
      endTimeMs,
      totalMs,
      pingCount,
      pingsPerSec,
      pingsExpectedPerSec,
      missedPingsPerSec,
      pressure,
    })
    startTimeMs = +new Date()
    pingCount = 0
    setTimeout(heartbeat, 5000)
  }
  setTimeout(heartbeat, 5000)

  const server = createServer((sock) => {
    const thisConnId = connId++
    openConnectionCount++
    console.log(`C${thisConnId} (${openConnectionCount} connections)`)
    let isCleanedUp = false

    const cleanup = () => {
      if (isCleanedUp) return
      isCleanedUp = true
      console.log(`C${thisConnId} cleanup`, sock.destroyed)
      openConnectionCount--
    }

    const dispatch: {
      [_ in MessageTypes]?: (e: MessageWrapper) => void
    } = {
      [MessageTypes.LoginRequest]: async (e) => {
        const msg = unpackLoginRequest(e)
        const reply = await settings.onLogin(thisConnId, msg)
        authenticated[thisConnId] = reply?.uid
        if (!reply) return // don't send reply
        const packed = packLoginResponse(e, reply)
        sock.write(packed)
      },
      [MessageTypes.PositionUpdateRequest]: async (e) => {
        const msg = unpackPositionUpdateRequest(e)
        pingCount++
        settings.onPositionUpdate(thisConnId, msg)
      },
    }

    const { onRawMessage, handleSocketDataEvent } = createMessageHandler()
    onRawMessage((e) => {
      try {
        if (e.type != MessageTypes.LoginRequest && !authenticated[thisConnId])
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

    sock.on('close', (hadError) => {
      console.log(`C${thisConnId}: close`, { hadError })
      cleanup()
    })

    sock.on('data', handleSocketDataEvent)
    sock.on('drain', () => console.log(`C${thisConnId}: drain`))
    sock.on('end', () => {
      console.log(`C${thisConnId}: end`)
      cleanup()
    })
    sock.on('error', (err) => {
      console.error(`C${thisConnId}: error`, err)
      cleanup()
    })
    sock.on('lookup', (err, address, family, host) =>
      console.log(`C${thisConnId}: lookup`, { err, address, family, host })
    )
    sock.on('timeout', () => {
      console.log(`C${thisConnId}: timeout`)
      cleanup()
    })
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
