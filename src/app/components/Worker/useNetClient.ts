import { useEffect } from 'react'
import { createClientNetcode } from '../../../client'
import { useAppSelector } from '../../store'

export const useNetClient = () => {
  const idToken = useAppSelector((state) => state.session.idToken)
  console.log('using net client', { idToken })
  useEffect(() => {
    if (!idToken) return
    const client = createClientNetcode()
    const { onConnect, login } = client

    const unsub = onConnect(() => {
      login({ idToken })
      console.log('connected')
    })
    return () => {
      unsub()
    }
  }, [idToken])
}
