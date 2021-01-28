import {
  ClientNetcode,
  createClientNetcode,
  PositionUpdateRequest,
} from '@rini/common'
import { useEffect, useState } from 'react'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { idToken } = auth
  const [authenticationError, setAuthenticationError] = useState<Error>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [client, setClient] = useState<ClientNetcode>()

  useEffect(() => {
    const client = createClientNetcode({
      address: 'localhost',
      port: 41234,
    })

    setClient(client)

    return () => {
      console.log(`Unmounting useNetSlice`)
      setIsAuthenticated(false)
      client.close()
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
          setAuthenticationError(undefined)
          return setIsAuthenticated(true)
        })
        .catch((e) => {
          console.error(e)
          setIsAuthenticated(false)
          setAuthenticationError(e)
          tid = setTimeout(login, 5000)
        })
    login()
    return () => {
      clearTimeout(tid)
    }
  }, [client, idToken])

  const sendPosition = (pos: PositionUpdateRequest) => client?.sendPosition(pos)

  return { isAuthenticated, authenticationError, sendPosition }
}
