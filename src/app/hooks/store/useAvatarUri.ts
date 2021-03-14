import { DEFAULT_AVATAR_URI } from '../../../engine/redux/DEFAULT_AVATAR'
import { EntityId } from '../../../engine/storage/Database'
import { useAppSelector } from './useAppSelector'

export const useAvatarUri = (id: EntityId): string | undefined =>
  useAppSelector((state) => state.game.profiles[id]?.avatar.current.uri || DEFAULT_AVATAR_URI)
