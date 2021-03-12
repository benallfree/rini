import { keys } from '@s-libs/micro-dash'
import { useAppSelector } from './useAppSelector'

export const useNearbyEntityCount = () => {
  const len = useAppSelector((state) => keys(state.game.nearbyEntitiesById).length)
  return len
}
