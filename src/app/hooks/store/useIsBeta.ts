import { useAppSelector } from './useAppSelector'

export const useIsBeta = () => useAppSelector((state) => state.game.isBeta)
