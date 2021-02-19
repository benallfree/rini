import WebSocket = require('isomorphic-ws')
import { callem, CallemEmitter, CallemSubscriber } from '../callem'
import {
  AnyMessage,
  LoginRequest,
  MessageTypes,
  NearbyEntities,
  netcode,
  PositionUpdate,
} from '../common'
import { MessageWrapper } from '../n53'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  host: string
  port: number
  maxRetries: number
  retryDelayMs: number
  awaitReplyTimeoutMs: number
}

export type ConnectEvent = { attempt: number }
export type DisconnectEvent = { attempt: number }

export type SocketConnection = {
  onOpen: CallemSubscriber
  onData: CallemSubscriber<{ buffer: Buffer }>
  onError: CallemSubscriber<{ error: Error }>
  onClose: CallemSubscriber
  destroy: () => void
  write: (buffer: Buffer) => Promise<void>
}

export const createClientNetcode = (
  idToken: string,
  settings?: Partial<ClientNetcodeConfig>
) => {
  let retryCount = 0
  let isConnected = false

  const _settings: ClientNetcodeConfig = {
    host: 'localhost',
    port: 3000,
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

  const [onMessage, emitMessage] = callem<MessageWrapper>()
  const [onConnect, emitConnect] = callem<ConnectEvent>()
  const [onDisconnect, emitDisconnect] = callem<DisconnectEvent>()

  let conn: WebSocket
  const connect = () => {
    retryTid = undefined
    conn = new WebSocket(`ws://${host}:${port}`)
    conn.onmessage = (e) => {
      const { data } = e
      if (typeof data !== 'string') {
        throw new Error(`Unsupported data type ${data}`)
      }
      const msg = netcode.unpack(data)
      emitMessage(msg)
    }

    conn.onopen = () => {
      retryCount = 0
      console.log('connected')
      console.log('listening for data')

      login({ idToken })
        .then(() => {
          isConnected = true
          emitConnect({
            attempt: retryCount,
          })
        })
        .catch((e) => {
          console.error(`Error logging in`, e)
          cleanup()
          reconnect()
        })
    }

    conn.onclose = () => {
      console.log('close')
      cleanup()
      reconnect()
    }

    conn.onerror = (e) => {
      console.error(e)
      cleanup()
      reconnect()
    }

    const cleanup = () => {
      console.log('Cleaning up')
      conn.close()
      isConnected = false
      emitDisconnect({
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

  const sendMessageAndAwaitReply = async <
    TMessage extends AnyMessage,
    TReply extends AnyMessage
  >(
    type: MessageTypes,
    msg: TMessage
  ): Promise<TReply> => {
    const [packed, certified] = netcode.pack(type, msg)
    console.log({ certified })
    return new Promise<TReply>((resolve, reject) => {
      const tid = setTimeout(() => {
        unsub()
        reject(`Timed out awaiting reply to ${certified.id}`)
      }, awaitReplyTimeoutMs)
      const unsub = onMessage((m) => {
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
    const [packed] = netcode.pack(type, msg)
    send(packed).catch((e) => {
      console.error(`Error sending message`, e)
    })
  }

  const login = (message: LoginRequest) =>
    sendMessageAndAwaitReply(MessageTypes.Login, message)

  const updatePosition = async (message: PositionUpdate) => {
    sendMessage(MessageTypes.PositionUpdate, message)
  }

  const send = async (data: string) => conn.send(data)

  // Listen for important messages
  const [onNearbyEntities, emitNearbyEntities] = callem<NearbyEntities>()
  const dispatchHandlers: { [_ in MessageTypes]?: CallemEmitter<any> } = {
    [MessageTypes.NearbyEntities]: emitNearbyEntities,
  }
  onMessage((m) => {
    // console.log(`got raw message incoming`, m)
    const dispatchHandler = dispatchHandlers[m.type as MessageTypes]
    if (!dispatchHandler) return // Not handled
    dispatchHandler(m.message)
  })

  const api = {
    close: () => conn.close(),
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
