import { ClientNetcode, createClientNetcode } from '@rini/client'
import { PositionUpdateRequest } from '@rini/common'
import { useEffect, useState } from 'react'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { idToken } = auth
  const [authenticationError, setAuthenticationError] = useState<Error>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [client, setClient] = useState<ClientNetcode>()

  useEffect(() => {
    if (!idToken) return
    const client = createClientNetcode(idToken, {
      host: 'localhost',
      port: 41234,
    })

    setClient(client)

    return () => {
      console.log(`Unmounting useNetSlice`)
      setIsAuthenticated(false)
      client.close()
    }
  }, [idToken])

  useEffect(() => {
    console.log({ client, data: idToken })
    if (!client) return
    if (!idToken) return
    console.log('sending login cmd')
    let tid: ReturnType<typeof setTimeout>
    const login = () =>
      client
        .login({ idToken })
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

  const sendPosition = async (msg: PositionUpdateRequest) => {
    if (!client) return
    console.log('updating position', { msg })
    const response = await client.updatePosition(msg)
    return response.nearby
  }

  const api = {
    isAuthenticated,
    authenticationError,
    sendPosition,
  }

  return api
}
