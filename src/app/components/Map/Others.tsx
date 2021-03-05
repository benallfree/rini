import { map } from '@s-libs/micro-dash'
import Bottleneck from 'bottleneck'
import React, { FC, useEffect } from 'react'
import { Image, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { fx } from '../../assets/fx'
import { BundledImages } from '../../assets/images'
import { engine } from '../../engine'
import { useNearbyEntityIds, useNearbyEntityPosition } from '../../hooks'

const playScore = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 100 })
  return () => limiter.schedule(() => fx.suck.play().then(fx.point.play))
})()

const playEnter = (() => {
  const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 50 })
  return () => limiter.schedule(() => fx.chime.play())
})()

const LAST_SEEN_TTL = 5000
const LAST_AWARDED_TTL = 5000

const api = (() => {
  const seen: { [_: string]: { lastAwarded: number; lastAppeared: number; lastSeen: number } } = {}

  const update = (id: string) => {
    if (!seen[id]) {
      seen[id] = {
        lastAwarded: 0,
        lastAppeared: 0,
        lastSeen: 0,
      }
    }
    const now = +new Date()
    const e = seen[id]
    if (now - e.lastSeen > LAST_SEEN_TTL) {
      playEnter().catch(console.error)
    }
    e.lastSeen = now
    const distance = engine.select((state) => state.nearbyEntitiesById[id].distance)
    if (distance < 30 && now - e.lastAwarded > LAST_AWARDED_TTL) {
      playScore().catch(console.error)
      e.lastAwarded = now
    }
  }

  const hasScoredRecently = (id: string) => {
    const now = +new Date()
    return now - seen[id]?.lastAwarded <= LAST_AWARDED_TTL
  }

  return {
    update,
    hasScoredRecently,
  }
})()

const Entity: FC<{ entityId: string }> = (props) => {
  const { entityId } = props
  const state = useNearbyEntityPosition(entityId)
  useEffect(() => {
    if (!state) return
    const { id } = state
    api.update(id)
  }, [state])
  // console.log('Entity', state)
  if (!state) return <></>
  const { latitude, longitude, id, distance } = state

  return (
    <Marker
      key={id}
      coordinate={{ latitude, longitude }}
      title={id}
      description={distance.toString()}>
      <View
        style={{
          width: 36,
          height: 36,
        }}>
        <View
          style={{
            backgroundColor: api.hasScoredRecently(id) ? 'green' : undefined,
            position: 'absolute',
            borderRadius: 32,
            width: 36,
            height: 36,
            opacity: 0.4,
          }}></View>
        <Image
          source={BundledImages.Tesla}
          style={{ width: 32, height: 32, position: 'absolute', top: 4, left: 2 }}
          resizeMode="contain"
        />
      </View>
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
