import { useAppSelector } from './useAppSelector'

export const useAvatarSalt = () => {
  return useAppSelector((state) => {
    const { profile } = state.game.player
    if (!profile) {
      throw new Error(`Profile must be defined here`)
    }
    return profile.avatar.salts[profile.avatar.type]
  })
}
