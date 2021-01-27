import { createSocket } from 'dgram'
import { LoginRequest, sendLoginRequest } from './messages'
import { handleSocketDataEvent } from './private/handleSocketDataEvent'

export type ClientMessageSender = (msg: Buffer) => Promise<void>

export type ClientNetcodeConfig = {
  address: string
  port: number
}

export function randomPort() {
  return (Math.random() * 60536) | (0 + 5000) // 60536-65536
}

export const createClientNetcode = (settings: ClientNetcodeConfig) => {
  const { address, port } = settings

  const socket = createSocket({ type: 'udp4' })
  socket.bind(randomPort())

  const send = (buf: Buffer) =>
    new Promise<void>((resolve) => {
      console.log(`Sending msg to`, buf, { address, port })
      socket.send(buf, 0, buf.length, port, address, (err) => {
        if (err) {
          console.error(err)
          throw err
        }
        resolve()
      })
    })

  socket.on('message', handleSocketDataEvent)

  return {
    close: () => socket.close(),
    sendLoginMessage: (msg: LoginRequest) => sendLoginRequest(msg, send),
  }
}

export type ClientNetcode = ReturnType<typeof createClientNetcode>
