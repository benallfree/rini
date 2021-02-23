import React, { FC } from 'react'
import { Marker } from 'react-native-maps'
import { useAppSelector } from '../../store'

export const Others: FC = () => {
  const nearby = useAppSelector((state) => state.entities.nearby)
  if (!nearby) return null

  return (
    <>
      {nearby.map((player) => (
        <Marker
          pinColor={'blue'}
          key={player.key}
          coordinate={player}
          title={player.key}
          description={player.distance.toString()}
        />
      ))}
    </>
  )
}
