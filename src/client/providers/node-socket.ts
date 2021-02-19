import net from 'net'
import { callem } from '../../callem'
import { SocketConnection } from '../createClientNetcode'

export const createNodeSocketProvider = () => {
  const createConnection = (settings: {
    host: string
    port: number
  }): SocketConnection => {
    const conn = net.createConnection(settings)
    conn.on('connect', () => {
      console.log('connect')
      emitOpen({})
      conn.on('data', (buffer) => {
        console.log('data', buffer)
        emitData({ buffer })
      })
    })
    conn.on('close', () => {
      console.log('close')
      emitClose({})
    })
    conn.on('end', () => {
      console.log('end')
      emitClose({})
    })
    conn.on('error', (error) => {
      console.log('error', { error })
      emitError({ error })
    })
    conn.on('drain', () => console.log('drain'))
    conn.on('lookup', () => console.log('lookup'))
    conn.on('timeout', () => {
      console.log('timeout')
      emitError({ error: new Error(`Timeout`) })
    })

    const destroy = () => conn.destroy()
    const write = (buf: Buffer) => {
      return new Promise<void>((resolve, reject) => {
        conn.write(buf, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
    }

    const [onOpen, emitOpen] = callem<{}>()
    const [onData, emitData] = callem<{ buffer: Buffer }>()
    const [onError, emitError] = callem<{ error: Error }>()
    const [onClose, emitClose] = callem<{}>()
    return { onOpen, onData, onClose, onError, destroy, write }
  }

  return {
    createConnection,
  }
}
