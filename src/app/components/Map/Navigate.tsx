import React, { FC } from 'react'
import { GestureResponderEvent, View } from 'react-native'
import { Icon } from 'react-native-elements'

export const Navigate: FC<{
  size?: number
  isActive?: boolean
  onPress?: (event: GestureResponderEvent) => void
}> = (props) => {
  const { size, onPress, isActive } = {
    onPress: () => {},
    isActive: true,
    size: 50,
    ...props,
  }
  const iconSize = size * 0.5
  const leftTop = (size - iconSize) / 2
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          opacity: 0.4,
          borderRadius: size / 2,
          width: size,
          height: size,
        }}></View>
      <View style={{ position: 'absolute', top: leftTop, left: leftTop - 1 }}>
        <Icon
          type="font-awesome-5"
          name="road"
          onPress={onPress}
          size={iconSize}
          style={{
            color: isActive ? 'white' : 'black',
          }}
        />
      </View>
    </View>
  )
}
