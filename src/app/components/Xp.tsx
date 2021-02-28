import MaskedView from '@react-native-masked-view/masked-view'
import React, { FC } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-elements'
import { XpUpdate } from '../../common'

export const Xp: FC<{ info: XpUpdate }> = (props) => {
  const { info } = props
  const { current, goal, start, level } = info
  const WIDTH = 300
  const INDENT = 80
  return (
    <View>
      <MaskedView
        style={{ position: 'absolute', top: 13, left: 20 }}
        maskElement={
          <View
            style={{
              backgroundColor: 'transparent',
              height: 15,
              width: WIDTH,
            }}>
            <View
              style={{
                backgroundColor: 'white',
                height: 15,
                width: WIDTH,
                borderRadius: 10,
              }}></View>
          </View>
        }>
        <View
          style={{
            position: 'absolute',
            backgroundColor: 'black',
            opacity: 0.6,
            height: 15,
            width: WIDTH,
            borderRadius: 10,
          }}></View>

        <View style={{ position: 'absolute', top: 1, left: 25 }}>
          <Text style={{ color: 'white', fontSize: 10 }}>
            {Math.floor(current)}/{goal}
          </Text>
        </View>

        <View
          style={{
            position: 'absolute',
            left: INDENT,
            top: 0,
            height: 15,
            width: (WIDTH - INDENT) * ((current - start) / (goal - start)),
            backgroundColor: 'orange',
          }}></View>
      </MaskedView>
      <View
        style={{
          position: 'absolute',
          backgroundColor: 'blue',
          borderRadius: 40,
          width: 40,
          height: 40,
        }}>
        <View style={{ position: 'absolute', top: 2, left: 11 }}>
          <Text style={{ fontSize: 30, color: 'white', fontStyle: 'italic' }}>{level}</Text>
        </View>
      </View>
    </View>
  )
}
