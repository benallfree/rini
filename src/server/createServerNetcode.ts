import { NearbyDC } from 'georedis'
import { App, DEDICATED_COMPRESSOR_3KB, WebSocket } from 'uWebSockets.js'
import {
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  netcode,
  PositionUpdate,
  Session,
} from '../common'
import { MessageWrapper } from '../n53'

export type ServerMessageSender = (msg: Buffer) => Promise<number>

export type SocketSession = {
  connectionId: number
  idToken?: string
  uid?: string
  cleanup: () => void
}

export type MessageHandler<TIn, TOut = undefined> = (
  session: SocketSession,
  msg: TIn
) => Promise<TOut | void>
export type ServerNetcodeConfig = {
  getUidFromAuthToken: (idToken: string) => Promise<string | void>
  updatePosition: MessageHandler<PositionUpdate>
  getNearbyPlayers: MessageHandler<void, NearbyDC[]>
}

declare module 'uWebSockets.js' {
  interface WebSocket {
    connId: number
  }
}

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
  let connId = 0
  const sessions: { [_: number]: SocketSession } = {}

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

  type DispatchHandler = (ws: WebSocket, e: MessageWrapper) => Promise<void>

  const dispatch: {
    [_: number]: DispatchHandler
  } = {
    [MessageTypes.Login]: async (ws, e) => {
      const thisConnId = ws.connId
      const msg = e.message as LoginRequest
      console.log(`processing login request`, { msg })
      const uid = await settings.getUidFromAuthToken(msg.idToken)
      console.log(`uid resolved to `, { uid })
      if (!uid) return // don't send reply
      sessions[thisConnId].uid = uid
      sessions[thisConnId].idToken = msg.idToken

      const [packed] = netcode.pack<Session>(
        MessageTypes.Session,
        {
          uid,
        },
        e.id
      )
      console.log({ packed })
      ws.send(packed, false)
    },
    [MessageTypes.PositionUpdate]: async (ws, e) => {
      const thisConnId = ws.connId
      const wrapper = e as MessageWrapper<PositionUpdate>
      const msg = wrapper.message
      pingCount++
      await settings.updatePosition(sessions[thisConnId], msg)
      scheduleSendNearbyEntities(ws)
    },
  }

  let sendNearbyEntitiesTid: ReturnType<typeof setTimeout>
  const scheduleSendNearbyEntities = (ws: WebSocket) => {
    const thisConnId = ws.connId
    if (sendNearbyEntitiesTid) return
    if (!sessions[thisConnId]) return // Session has vanished
    const send = async () => {
      const session = sessions[thisConnId]
      if (!session) return // Session has vanished
      const nearby = await settings.getNearbyPlayers(session)
      if (!nearby) {
        throw new Error(`Could not fetch nearby players`)
      }

      const [packed] = netcode.pack<NearbyEntities>(
        MessageTypes.NearbyEntities,
        {
          nearby,
        }
      )
      ws.send(packed, false)
    }
    setTimeout(send, 500)
  }

  App()
    .ws('/*', {
      /* There are many common helper features */
      idleTimeout: 30,
      maxBackpressure: 1024,
      maxPayloadLength: 512,
      compression: DEDICATED_COMPRESSOR_3KB,

      open: (ws) => {
        const thisConnId = connId++
        openConnectionCount++
        console.log(`C${thisConnId} (${openConnectionCount} connections)`)

        let isCleanedUp = false
        const cleanup = () => {
          if (isCleanedUp) return
          isCleanedUp = true
          console.log(`C${thisConnId} cleanup`)
          openConnectionCount--
          delete sessions[thisConnId]
        }
        sessions[thisConnId] = {
          connectionId: thisConnId,
          cleanup,
        }
        ws.connId = thisConnId
      },

      message: (ws, message, isBinary) => {
        console.log('got a message')
        const wrapper = netcode.unpack(Buffer.from(message).toString())
        try {
          if (wrapper.type != MessageTypes.Login && !sessions[ws.connId]) {
            console.error(`unestablished session`, { wrapper })
            ws.close()
            return // Silently ignore unauthenticated
          }
          const dispatchHandler = dispatch[wrapper.type] as DispatchHandler
          if (!dispatchHandler) {
            throw new Error(`Unhandled message type ${wrapper.type}`)
          }
          dispatchHandler(ws, wrapper)
        } catch (e) {
          console.error(e)
        }
        /* Here we echo the message back, using compression if available */
        // let ok = ws.send(message, isBinary, true)
      },

      close: (ws, code, behavior) => {
        const { connId } = ws
        console.log(`C${connId}: close`, {
          code,
          behavior: Buffer.from(behavior).toString(),
        })
        sessions[connId].cleanup()
      },
    })

    .listen(3000, (listenSocket) => {
      if (listenSocket) {
        console.log('Listening to port 3000')
      }
    })

  return {}
}

export type ServerNetcode = ReturnType<typeof createServerNetcode>
