import { EntityId } from '../../engine/Database'
import { useAppSelector } from './useAppSelector'

export const useNearbyEntityPosition = (id: EntityId) => {
  return useAppSelector((state) => state.game.nearbyEntitiesById[id])
}
