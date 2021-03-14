import { EntityId } from '../../../engine'
import { useAppSelector } from './useAppSelector'

export const useNearbyEntityPosition = (id: EntityId) => {
  return useAppSelector((state) => state.game.nearbyEntitiesById[id])
}
