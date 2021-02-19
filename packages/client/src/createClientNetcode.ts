/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import {
  AnyMessage,
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  PositionUpdate,
} from '@rini/common'
import net, { Socket } from 'net'
import { callem } from '../../callem'
import { createNetcode } from '../../n53'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  host: string
  port: number
  maxRetries: number
  retryDelayMs: number
  awaitReplyTimeoutMs: number
}

export function randomPort() {
  return (Math.random() * 60536) | (0 + 5000) // 60536-65536
}

export type ConnectEvent = { address: string; port: number; attempt: number }
export type DisconnectEvent = { address: string; port: number; attempt: number }

export const createClientNetcode = (
  idToken: string,
  settings?: Partial<ClientNetcodeConfig>
) => {
  let retryCount = 0
  let isConnected = false

  const _settings: ClientNetcodeConfig = {
    host: 'localhost',
    port: 41234,
    maxRetries: 0,
    retryDelayMs: 5000,
    awaitReplyTimeoutMs: 1000,
    ...settings,
  }
  const {
    host,
    port,
    maxRetries,
    retryDelayMs,
    awaitReplyTimeoutMs,
  } = _settings

  const [onConnect, emitConnect] = callem<ConnectEvent>()
  const [onDisconnect, emitDisconnect] = callem<DisconnectEvent>()

  let socket: Socket
  const connect = () => {
    retryTid = undefined
    socket = net.createConnection({ port, host })
    socket.on('connect', () => {
      retryCount = 0
      console.log('connected')
      socket.on('data', handleSocketDataEvent)
      console.log('listening for data')

      login({ idToken })
        .then(() => {
          isConnected = true
          emitConnect({
            address: socket.remoteAddress || 'unknown',
            port: socket.remotePort || 0,
            attempt: retryCount,
          })
        })
        .catch((e) => {
          console.error(`Error logging in`, e)
          cleanup()
          reconnect()
        })
    })
    socket.on('close', () => {
      console.log('close')
      cleanup()
      reconnect()
    })
    socket.on('end', () => {
      console.log('end')
      cleanup()
      reconnect()
    })
    socket.on('error', (e) => {
      console.error(e)
      cleanup()
      reconnect()
    })
    socket.on('drain', () => console.log('drain'))
    socket.on('lookup', () => console.log('lookup'))
    socket.on('timeout', () => {
      console.log('timeout')
      cleanup()
    })

    const cleanup = () => {
      console.log('Cleaning up')
      socket.destroy()
      isConnected = false
      emitDisconnect({
        address: socket.remoteAddress || 'unknown',
        port: socket.remotePort || 0,
        attempt: retryCount,
      })
    }
  }

  let retryTid: ReturnType<typeof setTimeout> | undefined

  const reconnect = () => {
    if (retryTid) return
    console.log('scheduling reconnect')
    if (maxRetries && retryCount >= maxRetries) {
      console.log(`Max retries exceeded`)
      return
    }
    retryCount++
    retryTid = setTimeout(() => {
      console.log('attempting reconnect now')
      connect()
    }, retryDelayMs)
  }

  connect()

  const netcode = createNetcode()
  const { onRawMessage, handleSocketDataEvent } = createMessageHandler(
    transport
  )

  const sendMessageAndAwaitReply = async <
    TMessage extends AnyMessage,
    TReply extends AnyMessage
  >(
    type: MessageTypes,
    msg: TMessage
  ): Promise<TReply> => {
    const [packed, certified] = transport.pack(type, msg)
    console.log({ certified })
    return new Promise<TReply>((resolve, reject) => {
      const tid = setTimeout(() => {
        unsub()
        reject(`Timed out awaiting reply to ${certified.id}`)
      }, awaitReplyTimeoutMs)
      const unsub = onRawMessage((m) => {
        if (m.refId !== certified.id) return // Skip, it's not our message
        unsub()
        clearTimeout(tid)
        resolve((m as unknown) as TReply)
      })
      send(packed).catch((e) => {
        unsub()
        clearTimeout(tid)
        reject(`Error sending. Trigger reconnect`)
      })
    })
  }

  const sendMessage = <TMessage extends AnyMessage>(
    type: MessageTypes,
    msg: TMessage
  ): void => {
    const [packed] = transport.pack(type, msg)
    send(packed).catch((e) => {
      console.error(`Error sending message`, e)
    })
  }

  const login = (message: LoginRequest) =>
    sendMessageAndAwaitReply(MessageTypes.LoginRequest, message)

  const updatePosition = async (message: PositionUpdate) => {
    sendMessage(MessageTypes.PositionUpdate, message)
  }

  const send = (buf: Buffer) =>
    new Promise<void>((resolve) => {
      // console.log(`Sending msg to`, buf, { address, port })
      socket.write(buf, (err) => {
        if (err) {
          console.error(err, err.name)
          throw err
        }
        resolve()
      })
    })

  // Listen for important messages
  const [onNearbyEntities, emitNearbyEntities] = event<NearbyEntities>()
  const dispatchHandlers: { [_ in MessageTypes]?: EventEmitter<any> } = {
    [MessageTypes.NearbyEntities]: emitNearbyEntities,
  }
  onRawMessage((m) => {
    // console.log(`got raw message incoming`, m)
    const dispatchHandler = dispatchHandlers[m.type]
    if (!dispatchHandler) return // Not handled
    dispatchHandler(m.message)
  })

  const api = {
    close: () => socket.destroy(),
    login,
    updatePosition,
    onConnect,
    onDisconnect,
    isConnected: () => isConnected,
    onNearbyEntities,
  }
  return api
}

export type ClientNetcode = ReturnType<typeof createClientNetcode>
