import { useAppSelector } from './useAppSelector'

export const useAvatarSalt = (): string => {
  return useAppSelector((state) => {
    const { profile } = state.game.player
    if (!profile) {
      throw new Error(`Profile must be defined here`)
    }
    return profile.avatar.salts[profile.avatar.current.type]
  })
}
