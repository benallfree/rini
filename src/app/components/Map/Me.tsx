import React, { FC } from 'react'
import { Marker } from 'react-native-maps'
import { useAppSelector } from '../../store'

export const Me: FC = () => {
  const location = useAppSelector((state) => state.session.location)
  if (!location) return null

  return <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000} />
}
