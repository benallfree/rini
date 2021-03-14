import { IdenticonKey } from '../../../engine/storage/Database'
import { useAppSelector } from './useAppSelector'

export const useAvatarType = (): IdenticonKey => {
  return useAppSelector((state) => {
    const { profile } = state.game.player
    if (!profile) {
      throw new Error(`Profile must be defined here`)
    }
    return profile.avatar.current.type
  })
}