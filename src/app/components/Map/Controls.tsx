import React, { FC, useState } from 'react'
import { View } from 'react-native'
import { Navigate } from './Navigate'
import { Nearby } from './Nearby'
import { Overview } from './Overview'
import { Pill } from './Pill'

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
          flex: 1,
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
      </View>
    </View>
  )
}
