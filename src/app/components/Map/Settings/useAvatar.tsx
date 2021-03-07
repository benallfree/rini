import React from 'react'
import { engine } from '../../../engine'
import { useSelect, useUid } from '../../../hooks'
import { Identicon, IdenticonKey } from '../Identicon'

export const useAvatar = (size = 32) => {
  const uid = useUid()
  const type = useSelect((state) => state.profile.avatar.type)
  const salts = useSelect((state) => state.profile.avatar.salts)

  console.log({ salts })
  return {
    type,
    setType: (type: IdenticonKey) => {
      engine.setAvatarType(type)
    },
    recycle: () => {
      engine.setAvatarSalt(type, Math.random().toString())
    },
    Avatar: () => {
      if (!uid) return <></>
      return <Identicon value={uid + salts[type]} size={size} type={type} />
    },
  }
}
