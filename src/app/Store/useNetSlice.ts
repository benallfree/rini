import { useEffect, useState } from 'react'
import { ClientNetcode, createClientNetcode } from '../../client'
import { NearbyEntities, PositionUpdate } from '../../common'
import { useWebWorker } from '../../rn-webworker'
import workerJs from '../worker.inlined'
import { useAuthSlice } from './useAuthSlice'

export const useNetSlice = (auth: ReturnType<typeof useAuthSlice>) => {
  const { idToken } = auth
  const [authenticationError, setAuthenticationError] = useState<Error>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [client, setClient] = useState<ClientNetcode>()
  const [nearbyEntities, setNearbyEntities] = useState<NearbyEntities>()
  const { WebWorker } = useWebWorker(workerJs)

  useEffect(() => {
    if (!idToken) return
    const client = createClientNetcode(idToken, {
      host: 'localhost',
      port: 3000,
    })

    setClient(client)

    return () => {
      console.log(`Unmounting useNetSlice`)
      setIsAuthenticated(false)
      client.close()
    }
  }, [idToken])

  useEffect(() => {
    // Listen for nearby entities
    if (!client) return
    const { onNearbyEntities } = client
    const unsub = onNearbyEntities((e) => {
      setNearbyEntities(e)
    })
    return unsub
  }, [client])

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

  const sendPosition = async (msg: PositionUpdate) => {
    if (!client) return
    console.log('updating position', { msg })
    client.updatePosition(msg)
  }

  const api = {
    isAuthenticated,
    authenticationError,
    sendPosition,
    nearbyEntities,
  }

  return api
}