import { map } from '@s-libs/micro-dash'
import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Row, RowProps } from 'react-native-easy-grid'
import { Avatar, Text } from 'react-native-elements'
import { SvgFromXml } from 'react-native-svg'
import Geohash from '../../../../../bin/latlon-geohash'
import { HASH_PRECISION_HALF_KM } from '../../../../engine/redux/const'
import {
  AvatarSelectionInfo_InMemory,
  EntityId,
  IdenticonKey,
  IDENTICON_STYLES,
} from '../../../../engine/storage/Database'
import { engine } from '../../../engine'
import { usePlayerPosition } from '../../../hooks/store/usePlayerPosition'
import { useUid } from '../../../hooks/store/useUid'
import { useSmartTextFetch } from '../../../hooks/useSmartTextFetch'
import { SettingsSection } from './SettingsSection'

const PaddedRow: FC<RowProps> = ({ children, ...props }) => {
  return (
    <Row {...props} style={Object.assign({}, { padding: 10 }, props.style)}>
      {children}
    </Row>
  )
}

export const usePlayerPositionHash = (size = HASH_PRECISION_HALF_KM): string => {
  const position = usePlayerPosition()
  const { latitude, longitude } = position
  const [hash, setHash] = useState(Geohash.encode(latitude, longitude, size))
  useEffect(() => {
    setHash(Geohash.encode(latitude, longitude, size))
  }, [latitude, longitude, size])
  return hash
}

export const LiveAvatar: FC<{
  id: EntityId
  size: number
  type: IdenticonKey
  salt: string
  onPress: (event: AvatarSelectionInfo_InMemory) => void
}> = ({ id, size, type, salt, onPress }) => {
  const uri = `https://avatars.dicebear.com/api/${type}/${id + salt}.svg`
  const { text, isPending, error } = useSmartTextFetch(uri)
  if (isPending || !text) return <Text>Loading...</Text>
  const filtered = text.replace(/undefined/, '')
  if (error) return <Text>Error...</Text>
  const offset = 2
  const tokenSize = size - offset
  const avatarSize = tokenSize - tokenSize * 0.4
  return (
    <Avatar size={size} rounded onPress={() => onPress({ id, type, salt, svg: filtered })}>
      <View style={{ width: size, height: size }}>
        <View
          style={{
            width: tokenSize,
            height: tokenSize,
            position: 'absolute',
            backgroundColor: 'black',
            borderRadius: size,
            left: offset,
            top: offset,
            opacity: 0.4,
          }}></View>
        <View
          style={{
            width: tokenSize,
            height: tokenSize,
            position: 'absolute',
            backgroundColor: 'white',
            borderWidth: 1,
            borderRadius: size,
          }}></View>
        <SvgFromXml
          style={{
            position: 'absolute',
            left: (tokenSize - avatarSize) / 2,
            top: (tokenSize - avatarSize) / 2,
          }}
          height={avatarSize}
          width={avatarSize}
          xml={filtered}
        />
      </View>
    </Avatar>
  )
}

export const AvatarSettings: FC = () => {
  const hash = usePlayerPositionHash()
  const uid = useUid()
  // console.log('rendering avatar', { uid, hash })
  if (!uid) return null
  const handleAvatarSelection = (e: AvatarSelectionInfo_InMemory) => {
    engine.changePrimaryAvatar(e).catch(console.error)
  }
  return (
    <SettingsSection title="Choose an Avatar">
      <PaddedRow>
        <Text>{`Instructions: Walk or drive around to find your avatar. Every location on earth has a unique avatar for you. If you want an old one back, you'll have to go back to the place you found it.`}</Text>
      </PaddedRow>
      <PaddedRow style={{ flexWrap: 'wrap' }}>
        {map(IDENTICON_STYLES, (v, k) => {
          return (
            <View key={k} style={{ padding: 5 }}>
              <LiveAvatar
                id={uid}
                type={k}
                salt={hash}
                size={128}
                onPress={handleAvatarSelection}
              />
            </View>
          )
        })}
      </PaddedRow>
    </SettingsSection>
  )
}
