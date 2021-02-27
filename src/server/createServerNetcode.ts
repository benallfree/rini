import { NearbyDC } from 'georedis'
import {
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  netcode,
  PositionUpdate,
  Session,
} from '../common'
import { NearbyEntity } from '../common/NearbyEntities'
import { MessageWrapper } from '../n53'
import { Connection, WebSocketProvider } from './providers'

export type ServerMessageSender = (msg: Buffer) => Promise<number>

export type SocketSession = {
  connectionId: number
  idToken?: string
  uid?: string
  awards: { [_: string]: number }
  cleanup: () => void
}

export type MessageHandler<TIn, TOut = undefined> = (
  session: SocketSession,
  msg: TIn
) => Promise<TOut | void>
export type ServerNetcodeConfig = {
  provider: WebSocketProvider
  getUidFromAuthToken: (idToken: string) => Promise<string | void>
  updatePosition: MessageHandler<PositionUpdate>
  getNearbyPlayers: MessageHandler<void, NearbyDC[]>
}

const AWARD_DISTANCE = 50

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
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

    const pressure = pingsExpectedPerSec ? missedPingsPerSec / pingsExpectedPerSec : 0
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

  type DispatchHandler = (conn: Connection, e: MessageWrapper) => Promise<void>

  const dispatch: {
    [_: number]: DispatchHandler
  } = {
    [MessageTypes.Login]: async (conn, e) => {
      const thisConnId = conn.id
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
      conn.send(packed)
    },
    [MessageTypes.PositionUpdate]: async (conn, e) => {
      const thisConnId = conn.id
      const wrapper = e as MessageWrapper<PositionUpdate>
      const msg = wrapper.message
      pingCount++
      await settings.updatePosition(sessions[thisConnId], msg)
      scheduleSendNearbyEntities(conn)
    },
  }

  let sendNearbyEntitiesTid: ReturnType<typeof setTimeout>
  const scheduleSendNearbyEntities = (conn: Connection) => {
    const thisConnId = conn.id
    if (sendNearbyEntitiesTid) return
    if (!sessions[thisConnId]) return // Session has vanished
    const send = async () => {
      const session = sessions[thisConnId]
      if (!session) return // Session has vanished
      const nearby = await settings.getNearbyPlayers(session)
      if (!nearby) {
        throw new Error(`Could not fetch nearby players`)
      }

      const final = await Promise.all(
        nearby
          .filter((rec) => rec.key !== session.uid)
          .map(async (rec) => {
            if (rec.distance <= AWARD_DISTANCE && !session.awards[rec.key]) {
              session.awards[rec.key] = +new Date()
            }

            const final: NearbyEntity = {
              ...rec,
              awardedAt: session.awards[rec.key],
            }
            return final
          })
      )

      const [packed] = netcode.pack<NearbyEntities>(MessageTypes.NearbyEntities, {
        nearby: final,
      })
      conn.send(packed)
    }
    setTimeout(send, 500)
  }

  const { provider } = settings

  const { onOpen, onClose, onMessage, onError, start } = provider

  onOpen(({ conn }) => {
    openConnectionCount++
    const thisConnId = conn.id
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
      awards: {},
      cleanup,
    }
  })

  onClose(({ conn, code, reason }) => {
    const connId = conn.id
    console.log(`C${connId}: close`, {
      code,
      reason,
    })
    sessions[connId].cleanup()
  })

  onMessage(({ conn, data }) => {
    const wrapper = netcode.unpack(data)
    try {
      if (wrapper.type !== MessageTypes.Login && !sessions[conn.id].idToken) {
        console.error(`unestablished session`, { wrapper })
        conn.close()
        return // Silently ignore unauthenticated
      }
      const dispatchHandler = dispatch[wrapper.type] as DispatchHandler
      if (!dispatchHandler) {
        throw new Error(`Unhandled message type ${wrapper.type}`)
      }
      dispatchHandler(conn, wrapper)
    } catch (e) {
      console.error(e)
    }
    /* Here we echo the message back, using compression if available */
    // let ok = ws.send(message, isBinary, true)
  })

  start(3000)

  return {}
}

export type ServerNetcode = ReturnType<typeof createServerNetcode>
