import { EntityId } from '../../../engine'
import { useAppSelector } from './useAppSelector'

export const useNearbyEntityMovement = (id: EntityId) => {
  return useAppSelector((state) => state.game.nearbyEntitiesById[id])
}
