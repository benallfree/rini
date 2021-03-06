import React, { FC } from 'react'
import { useAppSelector } from '../hooks/store/useAppSelector'
import { Xp } from './Xp'

export const MyXp: FC = () => {
  const xp = useAppSelector((state) => state.session.xp)
  if (!xp) return null
  return <Xp info={xp} />
}
