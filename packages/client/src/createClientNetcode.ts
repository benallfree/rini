/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import { createMessageHandler, MessageWrapper } from '@rini/common'
import net, { Socket } from 'net'
import {
  LoginRequest,
  LoginResponse,
  packLoginRequest,
  packPositionUpdateRequest,
  PositionUpdateRequest,
  unpackLoginResponse,
} from '../../common/src/netcode/messages'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  address: string
  port: number
}

export function randomPort() {
  return (Math.random() * 60536) | (0 + 5000) // 60536-65536
}

export const createClientNetcode = (
  settings?: Partial<ClientNetcodeConfig>
) => {
  const _settings: ClientNetcodeConfig = {
    address: 'localhost',
    port: 41234,
    ...settings,
  }
  const { address, port } = _settings

  console.log({ net })
  const socket: Socket = net.createConnection(
    { port: 41234, host: 'localhost' },
    () => {
      console.log('connected')
    }
  )
  socket.on('connect', () => console.log('connected'))
  socket.on('close', () => console.log('close'))
  socket.on('end', () => console.log('end'))
  socket.on('error', () => console.log('error'))
  socket.on('drain', () => console.log('drain'))
  socket.on('lookup', () => console.log('lookup'))
  socket.on('timeout', () => console.log('timeout'))

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

  const { onRawMessage, handleSocketDataEvent } = createMessageHandler()
  socket.on('data', handleSocketDataEvent)
  onRawMessage((msg) => {
    console.log(`got msg`, msg)
  })

  const sendMessageAndAwaitReply = async (
    packed: Buffer
  ): Promise<MessageWrapper> => {
    const messageId = packed.readUInt32BE(0)
    return new Promise<MessageWrapper>((resolve, reject) => {
      const tid = setTimeout(() => {
        unsub()
        reject(`Timed out awaiting reply to ${messageId}`)
      }, 1000)
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

  const api = {
    close: () => socket.destroy(),
    login,
    updatePosition,
  }
  return api
}

export type ClientNetcode = ReturnType<typeof createClientNetcode>
