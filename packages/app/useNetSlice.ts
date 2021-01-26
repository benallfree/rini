import { createClientNetcode } from '@rini/common'
import { useEffect, useState } from 'react'
import dgram from 'react-native-udp'
import { randomPort } from './randomPort'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { user } = auth
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!user.data) return
    console.log('useEffect')
    const socket = dgram.createSocket({ type: 'udp4' })
    const port = randomPort()
    const remotePort = 41234
    const remoteAddress = '192.168.1.19'
    socket.bind(port)

    const client = createClientNetcode({
      send: (buf) =>
        new Promise<void>((resolve) => {
          socket.send(
            buf,
            undefined,
            undefined,
            remotePort,
            remoteAddress,
            (err) => {
              if (err) throw err
              console.log('Message sent!')
              resolve()
            }
          )
        }),
    })

    socket.once('listening', () => {
      setIsConnected(true)
      console.log('listening for messages')
      ;(async () => {
        try {
          if (!user.data) {
            throw new Error(`User does not exist, cannot log in.`)
          }
          const token = await user.data.getIdToken()
          const reply = await client.sendLoginMessage({ idToken: token })
          console.log('got login reply', { reply })
        } catch (e) {
          console.error(e)
        }
      })()
    })

    socket.on('message', client.handleMessage)

    return () => {
      console.log(`Unmounting`)
      setIsConnected(false)
      setIsAuthenticated(false)
      socket.close()
    }
  }, [user.data])

  return { isConnected, isAuthenticated }
}
