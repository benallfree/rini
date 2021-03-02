import { createSelector } from '@reduxjs/toolkit'
import { map, pick } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC } from 'react'
import { Image } from 'react-native'
import { Text } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import { shallowEqual } from 'react-redux'
import { fx } from '../../assets/fx'
import { BundledImages } from '../../assets/images'
import { RootState, useAppSelector } from '../../store'
import { NearbyEntitiesById } from '../../store/types'

const playScore = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 100 })
  return () => limiter.schedule(() => fx.suck.play().then(fx.point.play))
})()

const playEnter = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 })
  return () => limiter.schedule(() => fx.chime.play())
})()

const Entity: FC<{ entityId: string }> = (props) => {
  const { entityId } = props
  const state = useAppSelector((state) => {
    return pick(state.entities.nearby[entityId], 'id', 'latitude', 'longitude', 'distance')
  }, shallowEqual)
  const { latitude, longitude, id, distance } = state

  console.log('Entity', { latitude, longitude, id, distance })
  return (
    <Marker
      key={id}
      coordinate={{ latitude, longitude }}
      title={id}
      description={distance.toString()}>
      <Image source={BundledImages.Tesla} style={{ width: 16, height: 16 }} resizeMode="contain" />
      <Text>{distance}</Text>
    </Marker>
  )
}

const selectNearbyIds = createSelector<RootState, NearbyEntitiesById, string[]>(
  (state) => state.entities.nearby,
  (nearby) => map(nearby, (e) => e.id).sort()
)

export const Others: FC = () => {
  const nearbyIds = useAppSelector(
    (state) => map(state.entities.nearby, (e) => e.id).sort(),
    shallowEqual
  )
  console.log('Others', nearbyIds.length)
  return (
    <>
      {map(nearbyIds, (entityId) => (
        <Entity key={entityId} entityId={entityId} />
      ))}
    </>
  )
}
