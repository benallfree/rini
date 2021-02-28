import { useEffect } from 'react'
import { client } from '../bootstrap'
import { useAppDispatch, useAppSelector } from '../store'
import { nearbyEntitiesChanged } from '../store/entitiesSlice'
import { xpUpdated } from '../store/sessionSlice'

export const useNetcode = () => {
  const idToken = useAppSelector((state) => state.session.idToken)
  const position = useAppSelector((state) => state.session.location)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!idToken) return

    const { connect, login } = client

    if (client.isConnected()) {
      login({ idToken })
    } else {
      connect(idToken)
    }
  }, [idToken])

  useEffect(() => {
    const { onNearbyEntities } = client

    const unsub = onNearbyEntities((e) => {
      dispatch(nearbyEntitiesChanged(e.nearby))
    })

    return () => {
      unsub()
    }
  }, [dispatch])

  useEffect(() => {
    const { isConnected, updatePosition } = client

    if (!isConnected()) return
    if (!position) return

    updatePosition({ ...position })
  }, [position])

  useEffect(() => {
    const { onXpUpdated } = client

    const unsub = onXpUpdated((e) => {
      dispatch(xpUpdated(e))
    })

    return () => {
      unsub()
    }
  })
}
