import { keys } from '@s-libs/micro-dash'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from './useAppSelector'

export const useNearbyEntityIds = () => {
  const ids = useAppSelector((state) => keys(state.game.nearbyEntitiesById).sort(), shallowEqual)
  return ids
}
