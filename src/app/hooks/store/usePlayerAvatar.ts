import { IdenticonKey } from '../../../engine/Database'
import { engine } from '../../engine'
import { useAvatarSalt } from './useAvatarSalt'
import { useAvatarType } from './useAvatarType'
import { useUid } from './useUid'

export const usePlayerAvatar = () => {
  const uid = useUid()
  const type = useAvatarType()
  const salt = useAvatarSalt()

  if (!uid) {
    throw new Error(`UID must be defined here`)
  }

  return {
    uid,
    salt,
    type,
    setType: (type: IdenticonKey) => {
      engine.setAvatarType(type)
    },
    recycle: () => {
      engine.setAvatarSalt(type, Math.random().toString())
    },
  }
}
