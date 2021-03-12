import { useAppSelector } from './hooks'

export const useIsOnline = () => useAppSelector((state) => state.game.isOnline)
