import { NearbyDC } from 'georedis'
import { createServer } from 'net'
import {
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  PositionUpdate,
  schemas,
} from '../common'
import { BinpackStruct, createNetcode, MessageWrapper } from '../n53'

export type ServerMessageSender = (msg: Buffer) => Promise<number>

export type Session = {
  connectionId: number
  idToken: string
  uid: string
}

export type MessageHandler<TIn, TOut = undefined> = (
  session: Session,
  msg: TIn
) => Promise<TOut | void>
export type ServerNetcodeConfig = {
  getUidFromAuthToken: (idToken: string) => Promise<string | void>
  updatePosition: MessageHandler<PositionUpdate>
  getNearbyPlayers: MessageHandler<void, NearbyDC[]>
}

export const createServerNetcode = (settings: ServerNetcodeConfig) => {
  let connId = 0
  const sessions: { [_: number]: Session } = {}

  const transport = createNetcode(schemas)
  const { onRawMessage, handleSocketDataEvent } = transport

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

    type DispatchHandler = (e: MessageWrapper<BinpackStruct>) => Promise<void>

    const dispatch: {
      [_: number]: DispatchHandler
    } = {
      [MessageTypes.Login]: async (e) => {
        const msg = e.message as LoginRequest
        console.log(`processing login request`, { msg })
        const uid = await settings.getUidFromAuthToken(msg.idToken)
        console.log(`uid resolved to `, { uid })
        if (!uid) return // don't send reply
        sessions[thisConnId] = {
          uid,
          connectionId: thisConnId,
          idToken: msg.idToken,
        }

        const [packed] = transport.pack(
          MessageTypes.Session,
          sessions[thisConnId],
          e.id
        )
        console.log({ packed })
        sock.write(packed)
      },
      [MessageTypes.PositionUpdate]: async (e) => {
        const wrapper = e as MessageWrapper<PositionUpdate>
        const msg = wrapper.message
        pingCount++
        await settings.updatePosition(sessions[thisConnId], msg)
        scheduleSendNearbyEntities()
      },
    }

    let sendNearbyEntitiesTid: ReturnType<typeof setTimeout>
    const scheduleSendNearbyEntities = () => {
      if (sendNearbyEntitiesTid) return
      const send = async () => {
        const nearby = await settings.getNearbyPlayers(sessions[thisConnId])
        if (!nearby) {
          throw new Error(`Could not fetch nearby players`)
        }

        console.log({ nearby })
        const [packed] = transport.pack<NearbyEntities>(
          MessageTypes.NearbyEntities,
          {
            nearby,
          }
        )
        sock.write(packed)
      }
      setTimeout(send, 500)
    }

    onRawMessage((e) => {
      console.log(`received`, { e })
      try {
        if (e.type != MessageTypes.Login && !sessions[thisConnId]) {
          console.error(`unestablished session`, { e })
          sock.destroy()
          return // Silently ignore unauthenticated
        }
        const dispatchHandler = dispatch[e.type] as DispatchHandler
        if (!dispatchHandler) {
          throw new Error(`Unhandled message type ${e.type}`)
        }
        dispatchHandler(e)
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
