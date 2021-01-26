import { makeAuthMessage } from '@rini/common'
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
    const address = '192.168.1.19'
    socket.bind(port)
    socket.once('listening', () => {
      setIsConnected(true)
      console.log('listening for messages')

      const sendLoginMessage = async () => {
        return new Promise<void>((resolve) => {
          if (!user.data) {
            throw new Error(`User does not exist, cannot log in.`)
          }
          user.data?.getIdToken().then((token) => {
            const waitForAck = (msg: any, rinfo: any) => {
              console.log('Messagxe receiveddd', { msg, rinfo })
              socket.off('message', waitForAck)
            }
            socket.on('message', waitForAck)
            console.log(token.length, token)
            socket.send(
              makeAuthMessage(token),
              undefined,
              undefined,
              41234,
              address,
              (err) => {
                if (err) throw err
                console.log('Message sent!')
                resolve()
              }
            )
          })
        })
      }
      try {
        sendLoginMessage()
      } catch (e) {
        console.log(e)
      }
    })

    socket.on('message', (msg, rinfo) => {
      console.log('Message receiveddd', { msg, rinfo })
    })

    return () => {
      console.log(`Unmounting`)
      setIsConnected(false)
      setIsAuthenticated(false)
      socket.close()
    }
  }, [user.data])

  return { isConnected, isAuthenticated }
}
