import * as WebSocket from 'isomorphic-ws'
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

export interface Logger {
  info(...args: any[]): void
  warn(...args: any[]): void
  debug(...args: any[]): void
  error(...args: any[]): void
}

export type ClientNetcodeConfig = {
  idToken: string
  host: string
  port: number
  maxRetries: number
  retryDelayMs: number
  awaitReplyTimeoutMs: number
  logger: Logger
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

export const createClientNetcode = (settings?: Partial<ClientNetcodeConfig>) => {
  let retryCount = 0
  let isConnected = false

  const _settings: ClientNetcodeConfig = {
    idToken: '',
    host: '192.168.1.2',
    port: 3000,
    maxRetries: 0,
    retryDelayMs: 5000,
    awaitReplyTimeoutMs: 1000,
    ...settings,
    logger: {
      info: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.log,
      ...settings?.logger,
    },
  }
  const { idToken, host, port, maxRetries, retryDelayMs, awaitReplyTimeoutMs, logger } = _settings

  const [onMessage, emitMessage] = callem<MessageWrapper>()
  const [onConnect, emitConnect] = callem<ConnectEvent>()
  const [onDisconnect, emitDisconnect] = callem<DisconnectEvent>()

  let conn: WebSocket
  const connect = (maybeIdToken?: string) => {
    retryTid = undefined
    //@ts-ignore
    const Ws = WebSocket.default || WebSocket
    console.log({ Ws })
    //@ts-ignore
    conn = new Ws(`ws://${host}:${port}`)
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
      logger.debug('connected')
      logger.debug('listening for data')
      isConnected = true
      emitConnect({
        attempt: retryCount,
      })
      const _idToken = maybeIdToken ?? lastIdToken ?? idToken
      if (_idToken) {
        login({ idToken: _idToken }).catch((e) => {
          logger.error(`Error logging in`, e)
          cleanup()
          reconnect()
        })
      }
    }

    conn.onclose = () => {
      logger.debug('close')
      cleanup()
      reconnect()
    }

    conn.onerror = (e) => {
      logger.error(e)
      cleanup()
      reconnect()
    }

    const cleanup = () => {
      logger.debug('Cleaning up')
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
    logger.debug('scheduling reconnect')
    if (maxRetries && retryCount >= maxRetries) {
      logger.debug(`Max retries exceeded`)
      return
    }
    retryCount++
    retryTid = setTimeout(() => {
      logger.debug('attempting reconnect now')
      connect()
    }, retryDelayMs)
  }

  const sendMessageAndAwaitReply = async <TMessage extends AnyMessage, TReply extends AnyMessage>(
    type: MessageTypes,
    msg: TMessage
  ): Promise<TReply> => {
    const [packed, certified] = netcode.pack(type, msg)
    logger.debug({ certified })
    return new Promise<TReply>((resolve, reject) => {
      const tid = setTimeout(() => {
        unsub()
        reject(new Error(`Timed out awaiting reply to ${certified.id}`))
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
        reject(new Error(`Error sending. Trigger reconnect`))
      })
    })
  }

  const sendMessage = <TMessage extends AnyMessage>(type: MessageTypes, msg: TMessage): void => {
    const [packed] = netcode.pack(type, msg)
    send(packed).catch((e) => {
      logger.error(`Error sending message`, e)
    })
  }

  let lastIdToken: string
  const login = (message: LoginRequest) => {
    lastIdToken = message.idToken
    return sendMessageAndAwaitReply(MessageTypes.Login, message)
  }

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
    // logger.log(`got raw message incoming`, m)
    const dispatchHandler = dispatchHandlers[m.type as MessageTypes]
    if (!dispatchHandler) return // Not handled
    dispatchHandler(m.message)
  })

  const api = {
    connect,
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
