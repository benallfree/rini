import { EntityId } from '../../../engine/Database'
import { DEFAULT_AVATAR_URI } from '../../../engine/restore/DEFAULT_AVATAR'
import { useAppSelector } from './useAppSelector'

export const useAvatarUri = (id: EntityId): string | undefined =>
  useAppSelector((state) => state.game.profiles[id]?.avatar.current.uri || DEFAULT_AVATAR_URI)
