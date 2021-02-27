import { forEach } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC, useEffect, useRef } from 'react'
import { Image } from 'react-native'
import { Marker } from 'react-native-maps'
import { NearbyEntity } from '../../../common/NearbyEntities'
import { fx } from '../../assets/fx'
import { BundledImages } from '../../assets/images'
import { useAppSelector } from '../../store'

type Timeout = ReturnType<typeof setTimeout>

const awardHandled: { [_: string]: number } = {}

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
      pinColor={awardHandled[entity.key] ? 'green' : 'blue'}
      key={entity.key}
      coordinate={entity}
      title={entity.key}
      description={entity.distance.toString()}>
      <Image source={BundledImages.Tesla} style={{ width: 16, height: 16 }} resizeMode="contain" />
    </Marker>
  )
}

export const Others: FC = () => {
  const seen = useRef<{ [_: string]: Timeout }>({})
  const nearby = useAppSelector((state) => state.entities.nearby)

  useEffect(() => {
    forEach(seen.current, (tid) => {
      clearTimeout(tid)
    })
  }, [])

  useEffect(() => {
    if (!nearby) return
    nearby.forEach((n) => {
      const entityId = n.key
      const refreshDeleteIfIdle = (oldTid?: Timeout) => {
        clearTimeout(oldTid)
        const tid = setTimeout(() => {
          delete seen.current[entityId]
        }, 5000)
        return tid
      }
      if (!seen.current[entityId]) {
        playEnter()
      }
      if (n.awardedAt && awardHandled[n.key] !== n.awardedAt) {
        awardHandled[n.key] = n.awardedAt
        playScore()
      }

      seen.current[entityId] = refreshDeleteIfIdle(seen.current[entityId])
    })
  }, [nearby])

  if (!nearby) return null

  return (
    <>
      {nearby.map((player) => (
        <Entity key={player.key} entity={player} />
      ))}
    </>
  )
}
