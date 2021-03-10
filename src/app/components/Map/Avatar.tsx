import React, { FC, useMemo } from 'react'
import { EntityId } from '../../../engine/Database'
import { Identicon, IdenticonKey } from './Identicon'

export const Avatar: FC<{ uid: EntityId; salt: string; size: number; type: IdenticonKey }> = ({
  uid,
  salt,
  size,
  type,
}) => {
  return useMemo(() => {
    console.log('Avatar', { uid, type, salt })
    if (!uid) return <></>
    return <Identicon value={uid + salt} size={size} type={type} />
  }, [uid, salt, size, type])
}
