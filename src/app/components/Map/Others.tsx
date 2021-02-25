import { forEach } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC, useEffect, useRef } from 'react'
import { Marker } from 'react-native-maps'
import { fx } from '../../assets/fx'
import { useAppSelector } from '../../store'

type Timeout = ReturnType<typeof setTimeout>

const awardHandled: { [_: string]: number } = {}

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 100 })

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
        limiter.schedule(() => fx.chime.play())
      }
      if (n.awardedAt && awardHandled[n.key] !== n.awardedAt) {
        awardHandled[n.key] = n.awardedAt
        limiter.schedule(() => fx.suck.play().then(fx.point.play))
      }

      seen.current[entityId] = refreshDeleteIfIdle(seen.current[entityId])
    })
  }, [nearby])

  if (!nearby) return null

  return (
    <>
      {nearby.map((player) => (
        <Marker
          pinColor={awardHandled[player.key] ? 'green' : 'blue'}
          key={player.key}
          coordinate={player}
          title={player.key}
          description={player.distance.toString()}
        />
      ))}
    </>
  )
}
