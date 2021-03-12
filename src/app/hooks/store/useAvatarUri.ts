import { EntityId } from '../../../engine/Database'
import { useAppSelector } from './useAppSelector'

export const useAvatarUri = (id: EntityId): string | undefined =>
  useAppSelector((state) => state.game.profiles[id]?.avatar.current.uri)
