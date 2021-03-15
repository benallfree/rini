import Avatars from '@dicebear/avatars'
import sprites from '@dicebear/avatars-jdenticon-sprites'
import React, { FC } from 'react'
import { SvgFromXml } from 'react-native-svg'
import { EntityId } from '../../../engine'

export const Avatar: FC<{ uid: EntityId; size: number }> = ({ uid, size }) => {
  const avatars = new Avatars(sprites, { radius: size })
  const svg = avatars.create(uid)
  return <SvgFromXml width={size} height={size} xml={svg} />
}
