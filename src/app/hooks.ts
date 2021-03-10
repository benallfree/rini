import { keys } from '@s-libs/micro-dash'
import { shallowEqual, TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux'
import { AppDispatch, RootState } from '../engine'
import { EntityId, IdenticonKey } from '../engine/Database'
import { engine } from './engine'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = () => useStore<RootState>()

export const useIsReady = () => {
  return useAppSelector((state) => state.game.isReady)
}

export const usePlayerPosition = () => {
  const latitude = useAppSelector((state) => state.game.player.position?.latitude) as number
  const longitude = useAppSelector((state) => state.game.player.position?.longitude) as number
  const heading = useAppSelector((state) => state.game.player.position?.heading) as number
  return { latitude, longitude, heading }
}

export const useNearbyEntityCount = () => {
  const len = useAppSelector((state) => keys(state.game.nearbyEntitiesById).length)
  return len
}

export const useNearbyEntityIds = () => {
  const ids = useAppSelector((state) => keys(state.game.nearbyEntitiesById).sort(), shallowEqual)
  return ids
}

export const useNearbyEntityPosition = (id: EntityId) => {
  return useAppSelector((state) => state.game.nearbyEntitiesById[id])
}

export const useUid = () => {
  return useAppSelector((state) => state.game.player.uid)
}

export const useAvatarType = () => {
  return useAppSelector((state) => {
    const { profile } = state.game.player
    if (!profile) {
      throw new Error(`Profile must be defined here`)
    }
    return profile.avatar.type
  })
}

export const useAvatarSalt = () => {
  return useAppSelector((state) => {
    const { profile } = state.game.player
    if (!profile) {
      throw new Error(`Profile must be defined here`)
    }
    return profile.avatar.salts[profile.avatar.type]
  })
}

export const usePlayerAvatar = () => {
  const uid = useUid()
  const type = useAvatarType()
  const salt = useAvatarSalt()

  if (!uid) {
    throw new Error(`UID must be defined here`)
  }

  return {
    uid,
    salt,
    type,
    setType: (type: IdenticonKey) => {
      engine.setAvatarType(type)
    },
    recycle: () => {
      engine.setAvatarSalt(type, Math.random().toString())
    },
  }
}
