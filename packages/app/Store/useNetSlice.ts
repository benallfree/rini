import { ClientNetcode, createClientNetcode } from '@rini/common'
import { useEffect, useState } from 'react'
import dgram from 'react-native-udp'
import { randomPort } from '../randomPort'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { idToken } = auth
  const [authenticationError, setAuthenticationError] = useState<Error>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [client, setClient] = useState<ClientNetcode>()

  useEffect(() => {
    const socket = dgram.createSocket({ type: 'udp4', debug: true })
    socket.bind(randomPort())
    socket.once('listening', function () {
      const client = createClientNetcode({
        send: (buf) =>
          new Promise<void>((resolve) => {
            const remotePort = 41234
            const remoteAddress = '192.168.1.19'
            console.log(`Sending msg to`, buf, { remoteAddress, remotePort })
            socket.send(
              buf,
              undefined,
              undefined,
              remotePort,
              remoteAddress,
              (err) => {
                if (err) {
                  console.error(err)
                  throw err
                }
                resolve()
              }
            )
          }),
      })
      socket.on('message', client.handleSocketDataEvent)
      setClient(client)
    })

    return () => {
      console.log(`Unmounting useNetSlice`)
      setIsAuthenticated(false)
      socket.close()
    }
  }, [])

  useEffect(() => {
    console.log({ client, data: idToken })
    if (!client) return
    if (!idToken) return
    console.log('sending login cmd')
    let tid: ReturnType<typeof setTimeout>
    const login = () =>
      client
        .sendLoginMessage({ idToken })
        .then((reply) => {
          console.log('got login reply', { reply })
          return setIsAuthenticated(true)
        })
        .catch((e) => {
          console.error(e)
          setIsAuthenticated(false)
          setAuthenticationError(e)
          tid = setTimeout(login, 5000)
        })
        .finally(() => console.log('finally'))
    login()
    return () => {
      clearTimeout(tid)
    }
  }, [client, idToken])

  return { isAuthenticated, authenticationError }
}
