/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import {
  createMessageHandler,
  event,
  LoginRequest,
  LoginResponse,
  MessageWrapper,
  packLoginRequest,
  packPositionUpdateRequest,
  PositionUpdateRequest,
  unpackLoginResponse,
} from '@rini/common'
import net, { Socket } from 'net'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  address: string
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
    address: 'localhost',
    port: 41234,
    maxRetries: 0,
    retryDelayMs: 5000,
    awaitReplyTimeoutMs: 1000,
    ...settings,
  }
  const {
    address,
    port,
    maxRetries,
    retryDelayMs,
    awaitReplyTimeoutMs,
  } = _settings

  const [onConnect, emitConnect] = event<ConnectEvent>()
  const [onDisconnect, emitDisconnect] = event<DisconnectEvent>()

  let socket: Socket
  const connect = () => {
    retryTid = undefined
    socket = net.createConnection({ port: 41234, host: 'localhost' })
    socket.on('connect', () => {
      console.log('connected')
      socket.on('data', handleSocketDataEvent)
      console.log('listening for data')

      const unsub = onRawMessage((msg) => {
        console.log(`got msg`, msg)
      })
      cleanups.push(unsub)

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

    const cleanups = [() => socket.destroy()]
    const cleanup = () => {
      console.log('Cleaning up')
      cleanups.forEach((c) => c())
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

  const { onRawMessage, handleSocketDataEvent } = createMessageHandler()

  const sendMessageAndAwaitReply = async (
    packed: Buffer
  ): Promise<MessageWrapper> => {
    const messageId = packed.readUInt32BE(0)
    return new Promise<MessageWrapper>((resolve, reject) => {
      const tid = setTimeout(() => {
        unsub()
        reject(`Timed out awaiting reply to ${messageId}`)
      }, awaitReplyTimeoutMs)
      const unsub = onRawMessage((m) => {
        console.log('got raw message', m)
        if (m.refMessageId !== messageId) return // Skip, it's not our message
        unsub()
        clearTimeout(tid)
        resolve(m)
      })
      send(packed).catch(reject)
    })
  }

  const login = async (msg: LoginRequest): Promise<LoginResponse> => {
    const packed = packLoginRequest(msg)
    const wrapper = await sendMessageAndAwaitReply(packed)
    return unpackLoginResponse(wrapper)
  }

  const updatePosition = async (msg: PositionUpdateRequest): Promise<void> => {
    const packed = packPositionUpdateRequest(msg)
    return send(packed)
  }

  const send = (buf: Buffer) =>
    new Promise<void>((resolve) => {
      console.log(`Sending msg to`, buf, { address, port })
      socket.write(buf, (err) => {
        if (err) {
          console.error(err, err.name)
          throw err
        }
        resolve()
      })
    })

  const api = {
    close: () => socket.destroy(),
    login,
    updatePosition,
    onConnect,
    onDisconnect,
    isConnected: () => isConnected,
  }
  return api
}

export type ClientNetcode = ReturnType<typeof createClientNetcode>
