import React, { FC, useEffect, useState } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-elements'
import { CallemSubscriber } from '../../../callem'

export const Overlay: FC<{
  onIsFollowing: CallemSubscriber<boolean>
  startFollowing: () => void
}> = (props) => {
  const [isActive, setIsActive] = useState(false)
  const { onIsFollowing, startFollowing } = props
  useEffect(() => {
    return onIsFollowing((isFollowing) => {
      setIsActive(!isFollowing)
    })
  })

  if (!isActive) return <></>
  return (
    <View
      style={{
        position: 'absolute',
        width: '80%',
        left: '10%',
        borderRadius: 30,
        backgroundColor: 'black',
        opacity: 0.4,
        height: 70,
        bottom: 100,
      }}>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          borderRadius: 30,
          backgroundColor: 'black',
          opacity: 0.4,
          height: 70,
        }}></View>
      <Button
        containerStyle={{
          position: 'absolute',
          width: '100%',
          height: 70,
          borderRadius: 30,
        }}
        buttonStyle={{ backgroundColor: 'transparent' }}
        titleStyle={{ fontSize: 40, top: 0 }}
        title="Recenter"
        onPress={startFollowing}
      />
    </View>
  )
}
