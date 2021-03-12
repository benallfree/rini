import { useAppSelector } from './useAppSelector'

export const useIsReady = () => {
  return useAppSelector((state) => state.game.isReady)
}
