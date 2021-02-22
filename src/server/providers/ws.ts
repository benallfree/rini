import * as WebSocket from 'ws'
import {
  Connection,
  WebSocketProvider,
  WsCloseEvent,
  WsErrorEvent,
  WsMessageEvent,
  WsOpenEvent,
} from '.'
import { callem } from '../../callem'

export const createWsProvider = (): WebSocketProvider => {
  const [onOpen, emitOpen] = callem<WsOpenEvent>()
  const [onMessage, emitMessage] = callem<WsMessageEvent>()
  const [onClose, emitClose] = callem<WsCloseEvent>()
  const [onError, emitError] = callem<WsErrorEvent>()

  let connId = 0
  const mkConn = (ws: WebSocket, connId: number): Connection => ({
    id: connId,
    send: (data) => {
      return new Promise((resolve, reject) => {
        ws.send(data, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve(true)
        })
      })
    },
    close: async () => {
      ws.close()
      return true
    },
  })

  const start = async (port: number) => {
    return new Promise<boolean>((resolve, reject) => {
      const wss = new WebSocket.Server({ port })

      wss.on('connection', (ws) => {
        connId++
        const conn = mkConn(ws, connId)
        emitOpen({ conn })
        ws.on('message', (message) => {
          emitMessage({ conn, data: message.toString() })
        })
        ws.on('close', (code, reason) => {
          emitClose({ conn, code, reason })
        })
        ws.on('error', (error) => {
          emitError({ conn, error })
        })
      })

      wss.on('listening', () => {
        resolve(true)
      })
    })
  }

  return { onOpen, onMessage, onClose, onError, start }
}
