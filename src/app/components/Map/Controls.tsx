import Clipboard from 'expo-clipboard'
import React, { FC, useState } from 'react'
import { View } from 'react-native'
import { Icon } from 'react-native-elements'
import { showMessage } from 'react-native-flash-message'
import { Navigate } from './Navigate'
import { Nearby } from './Nearby'
import { Overview } from './Overview'
import { Pill } from './Pill'
import { Settings } from './Settings/Settings'

const Share: FC = () => {
  return (
    <View style={{ position: 'absolute', top: 10, left: 13 }}>
      <Icon
        type="font-awesome-5"
        name="share-alt"
        onPress={() => {
          Clipboard.setString(`https://apps.apple.com/us/app/rini/id1550533577`)
          showMessage({
            message: `App Store link copied! Thanks for supporting Rini.`,
            backgroundColor: 'rgb(237, 255, 137)',
            color: 'gray',
          })
        }}
        size={24}
      />
    </View>
  )
}

export const Controls: FC<{
  onOverviewPress: () => void
  onNavigatePress: () => void
  height: number
  width: number
}> = (props) => {
  const { onOverviewPress, onNavigatePress, width, height } = props
  const [mode, setMode] = useState<'overview' | 'navigate'>()
  return (
    <View style={{ height, width }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          backgroundColor: 'gray',
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          opacity: 0.4,
        }}></View>
      <View
        style={{
          padding: 5,
          width,
          height,
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}>
        <Pill>
          <Overview
            onPress={() => {
              setMode('overview')
              onOverviewPress()
            }}
            isActive={mode === 'overview'}
          />
        </Pill>
        <Pill>
          <Navigate
            onPress={() => {
              setMode('navigate')
              onNavigatePress()
            }}
            isActive={mode === 'navigate'}
          />
        </Pill>
        <Pill>
          <Nearby />
        </Pill>
        <Pill>
          <Settings />
        </Pill>
        <Pill>
          <Share />
        </Pill>
      </View>
    </View>
  )
}
