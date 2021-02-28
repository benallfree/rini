import getDistance from 'geolib/es/getPreciseDistance'
import { NearbyDC } from 'georedis'
import { callem } from '../callem'
import {
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  netcode,
  PositionUpdate,
  Session,
} from '../common'
import { NearbyEntity, XpUpdate } from '../common/messageTypes'
import { MessageWrapper } from '../n53'
import { Connection, WebSocketProvider } from './providers'

export type ServerMessageSender = (msg: Buffer) => Promise<number>

export type UserSession = {
  uid: string
  idToken: string
  position?: PositionUpdate
  xp: XpUpdate
  awards: { [_: string]: number }
}

const sessions: {
  [uid: string]: UserSession
} = {}

export type SocketSession = {
  connectionId: number
  uid?: string
  cleanup: () => void
}

export type MessageHandler<TIn, TOut = undefined> = (
  session: UserSession,
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
  const socketSessions: { [_: number]: SocketSession } = {}

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

  const [onLoginRx, emitLoginRx] = callem<{
    conn: Connection
    e: MessageWrapper<LoginRequest>
    uid: string
  }>()
  const [onPositionUpdateRx, emitPositionUpdateRx] = callem<{
    conn: Connection
    e: MessageWrapper<PositionUpdate>
  }>()

  type DispatchHandler = (conn: Connection, e: MessageWrapper) => Promise<void>

  const dispatch: {
    [_: number]: DispatchHandler
  } = {
    [MessageTypes.Login]: async (conn, e) => {
      const msg = e.message as LoginRequest
      console.log(`processing login request`, { msg })
      const uid = await settings.getUidFromAuthToken(msg.idToken)
      console.log(`uid resolved to `, { uid })
      if (!uid) return // don't send reply
      emitLoginRx({ e: e as MessageWrapper<LoginRequest>, conn, uid })
    },
    [MessageTypes.PositionUpdate]: async (conn, e) => {
      emitPositionUpdateRx({ e: e as MessageWrapper<PositionUpdate>, conn })
    },
  }

  onLoginRx(
    ({
      conn,
      e: {
        message: { idToken },
      },
      uid,
    }) => {
      const thisConnId = conn.id
      socketSessions[thisConnId].uid = uid
      if (!sessions[uid]) {
        sessions[uid] = {
          uid,
          idToken,
          xp: {
            current: 0,
            start: 0,
            goal: calcLevelGoal(2),
            level: 1,
          },
          awards: {},
        }
      }
    }
  )

  onLoginRx(({ conn, uid, e: { id } }) => {
    const [packed] = netcode.pack<Session>(
      MessageTypes.Session,
      {
        uid,
      },
      id
    )
    conn.send(packed)
  })

  const calcLevelGoal = (level: number) => {
    return 500 * Math.pow(level, 2) - 500 * level
  }

  const getSession = (conn: Connection) => {
    const { id } = conn
    const socketSession = socketSessions[id]
    if (!socketSession) {
      throw new Error(`Bad session ${id}`)
    }
    const { uid } = socketSession
    if (!uid) {
      return
    }
    const session = sessions[uid]
    return session
  }

  onPositionUpdateRx(() => {
    pingCount++
  })
  onPositionUpdateRx(({ conn, e: { message } }) => {
    const session = getSession(conn)
    if (!session) return
    const { send } = conn
    const { position } = session
    if (!position) return
    const points = getDistance(position, message, 0.1)
    const xp = session.xp
    const { level, current, goal } = xp
    if (current + points > goal) {
      session.xp = {
        ...xp,
        level: level + 1,
        start: calcLevelGoal(level + 1),
        goal: calcLevelGoal(level + 2),
      }
    }
    session.xp.current = session.xp.current + points
    const [packed] = netcode.pack<XpUpdate>(MessageTypes.XpUpdate, session.xp)
    send(packed)
  })
  onPositionUpdateRx(({ conn, e: { message } }) => {
    const session = getSession(conn)
    if (!session) return
    session.position = message
    settings.updatePosition(session, message)
  })
  onPositionUpdateRx(async ({ conn }) => {
    const session = getSession(conn)
    if (!session) return
    const { id, send } = conn
    const nearby = await settings.getNearbyPlayers(session)
    if (!nearby) {
      throw new Error(`Could not fetch nearby players`)
    }

    const final = nearby
      .filter((rec) => rec.key !== session.uid)
      .map((rec) => {
        if (rec.distance <= AWARD_DISTANCE && !session.awards[rec.key]) {
          session.awards[rec.key] = +new Date()
        }

        const final: NearbyEntity = {
          ...rec,
          awardedAt: session.awards[rec.key],
        }
        return final
      })

    const [packed] = netcode.pack<NearbyEntities>(MessageTypes.NearbyEntities, {
      nearby: final,
    })
    if (!socketSessions[id]) return // Session has vanished
    send(packed)
  })

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
      delete socketSessions[thisConnId]
    }
    socketSessions[thisConnId] = {
      connectionId: thisConnId,
      cleanup,
    }
  })

  onClose(({ conn, code, reason }) => {
    const connId = conn.id
    console.log(`C${connId}: close`, {
      code,
      reason,
    })
    const session = getSession(conn)
    delete session?.position
    socketSessions[connId].cleanup()
  })

  onMessage(({ conn, data }) => {
    const wrapper = netcode.unpack(data)
    const session = getSession(conn)
    try {
      if (wrapper.type !== MessageTypes.Login && !session) {
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
