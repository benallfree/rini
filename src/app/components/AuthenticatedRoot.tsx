import React, { FC } from 'react'
import { useNetcode } from '../hooks/useNetcode'
import { Map } from './Map/Map'

export const AuthenticatedRoot: FC = () => {
  useNetcode()

  return (
    <>
      <Map />
    </>
  )
}
