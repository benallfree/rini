import { useAppSelector } from './useAppSelector'

export const useUid = () => {
  return useAppSelector((state) => state.game.player.uid)
}
