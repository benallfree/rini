import { useAppSelector } from './useAppSelector'

export const useIsOnline = () => useAppSelector((state) => state.game.isOnline)
