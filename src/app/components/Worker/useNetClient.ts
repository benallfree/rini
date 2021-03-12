import { useEffect } from 'react'
import { client } from '../../bootstrap'
import { useAppSelector } from '../../hooks/hooks'

export const useNetClient = () => {
  const idToken = useAppSelector((state) => state.session.idToken)
  console.log('using net client', { idToken })
  useEffect(() => {
    if (!idToken) return

    const { connect, login, onNearbyEntities } = client

    if (client.isConnected()) {
      login({ idToken })
    } else {
      connect(idToken)
    }

    const unsub = onNearbyEntities((e) => {
      console.log('got nearby entities')
    })
    return () => {
      unsub()
    }
  }, [idToken])
}
