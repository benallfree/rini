import { ClientNetcode, createClientNetcode } from '@rini/common'
import { useEffect, useState } from 'react'
import dgram from 'react-native-udp'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { idToken } = auth
  const [authenticationError, setAuthenticationError] = useState<Error>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [client, setClient] = useState<ClientNetcode>()

  useEffect(() => {
    setTimeout(() => {
      console.log('snding')
      const sock = dgram.createSocket({ type: 'udp4', debug: true })

      sock.send('fooo', undefined, undefined, 41234, '192.168.1.19')
    }, 5000)

    const socket = dgram.createSocket({ type: 'udp4', debug: true })
    socket.on('connect', () => console.log('connect'))
    socket.on('listening', () => console.log('connect'))
    socket.on('error', (e) => console.log('error', e))
    socket.on('message', (m) => console.log('message', m))

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
              console.log('Message sent!', buf)
              resolve()
            }
          )
        }),
    })
    setClient(client)

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
