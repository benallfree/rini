import { App, DEDICATED_COMPRESSOR_3KB, WebSocket } from 'uWebSockets.js'
import { Connection, WsCloseEvent, WsErrorEvent, WsMessageEvent, WsOpenEvent } from '.'
import { callem } from '../../callem'

declare module 'uWebSockets.js' {
  interface WebSocket {
    connId: number
  }
}

export const createuWebSocketProvider = () => {
  const [onOpen, emitOpen] = callem<WsOpenEvent>()
  const [onMessage, emitMessage] = callem<WsMessageEvent>()
  const [onClose, emitClose] = callem<WsCloseEvent>()
  const [onError, emitError] = callem<WsErrorEvent>()

  function mkConn(ws: WebSocket): Connection {
    return {
      id: ws.connId,
      send: async (data) => ws.send(data, false),
      close: async () => {
        ws.close()
        return true
      },
    }
  }

  let connId = 0
  const app = App().ws('/*', {
    /* There are many common helper features */
    idleTimeout: 30,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    compression: DEDICATED_COMPRESSOR_3KB,

    open: (ws) => {
      ws.connId = connId++
      emitOpen({ conn: mkConn(ws) })
    },

    message: (ws, message, isBinary) => {
      if (isBinary) {
        throw new Error(`Binary message not supported`)
      }
      emitMessage({ conn: mkConn(ws), data: Buffer.from(message).toString() })
    },

    close: (ws, code, behavior) => {
      emitClose({ conn: mkConn(ws), code, reason: code.toString() })
    },
  })

  const start = (port: number) => {
    return new Promise<boolean>((resolve, reject) => {
      app.listen(port, (listenSocket) => {
        if (listenSocket) {
          console.log(`Listening to port ${port}`)
          resolve(true)
        }
      })
    })
  }

  return { onOpen, onMessage, onClose, onError, start }
}
