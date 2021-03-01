import { forEach, map } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC, useEffect, useRef } from 'react'
import { Image } from 'react-native'
import { Text } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import { fx } from '../../assets/fx'
import { BundledImages } from '../../assets/images'
import { useAppSelector } from '../../store'
import { NearbyEntity } from '../../store/slices/entitiesSlice'

const playScore = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 100 })
  return () => limiter.schedule(() => fx.suck.play().then(fx.point.play))
})()

const playEnter = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 })
  return () => limiter.schedule(() => fx.chime.play())
})()

const Entity: FC<{ entity: NearbyEntity }> = (props) => {
  const { entity } = props

  return (
    <Marker
      key={entity.id}
      coordinate={entity}
      title={entity.id}
      description={entity.distance.toString()}>
      <Image source={BundledImages.Tesla} style={{ width: 16, height: 16 }} resizeMode="contain" />
      <Text>{entity.distance}</Text>
    </Marker>
  )
}

export const Others: FC = () => {
  const seen = useRef<{ [_: string]: number }>({})
  const awardHandled = useRef<{ [_: string]: number }>({})

  const nearby = useAppSelector((state) => state.entities.nearby)
  const collisions = useAppSelector((state) => state.profile.collisionEventsByEntityId)

  useEffect(() => {
    forEach(seen.current, (tid) => {
      clearTimeout(tid)
    })
  }, [])

  useEffect(() => {
    if (!nearby) return
    forEach(nearby, (n, entityId) => {
      const now = +new Date()
      if (!seen.current[entityId] || now - seen.current[entityId] > 5000) {
        playEnter()
      }
      seen.current[entityId] = now
      if (collisions[n.id] && !awardHandled.current[n.id]) {
        awardHandled.current[n.id] = collisions[n.id].time
        console.log(collisions[n.id])
        playScore()
      }
    })
  }, [nearby, collisions])

  if (!nearby) return null

  return (
    <>
      {map(nearby, (entity, entityId) => (
        <Entity key={entityId} entity={entity} />
      ))}
    </>
  )
}
