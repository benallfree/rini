import { map } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC } from 'react'
import { Image } from 'react-native'
import { Marker } from 'react-native-maps'
import { fx } from '../../assets/fx'
import { BundledImages } from '../../assets/images'
import { useNearbyEntityIds, useNearbyEntityPosition } from '../../hooks'

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
  const state = useNearbyEntityPosition(entityId)
  // console.log('Entity', state)
  if (!state) return <></>
  const { latitude, longitude, id, distance } = state

  return (
    <Marker
      key={id}
      coordinate={{ latitude, longitude }}
      title={id}
      description={distance.toString()}>
      <Image source={BundledImages.Tesla} style={{ width: 32, height: 32 }} resizeMode="contain" />
      {/* <Text>{distance}</Text> */}
    </Marker>
  )
}

export const Others: FC = () => {
  const nearbyIds = useNearbyEntityIds()
  console.log('Others', nearbyIds.length)
  return (
    <>
      {map(nearbyIds, (entityId) => (
        <Entity key={entityId} entityId={entityId} />
      ))}
    </>
  )
}
