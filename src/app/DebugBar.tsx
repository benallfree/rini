import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { checkForUpdateAsync, reloadAsync } from 'expo-updates'
import React, { FC, useEffect, useState } from 'react'
import { TouchableHighlight } from 'react-native'
import { Text } from 'react-native-elements'

export const DebugBar: FC = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

  useEffect(() => {
    if (!Device.isDevice) return
    checkForUpdateAsync()
      .then((value) => {
        setIsUpdateAvailable(value.isAvailable)
      })
      .catch(console.error)
  }, [])

  const handleUpdate = () => {
    if (!isUpdateAvailable) return
    reloadAsync().catch(console.error)
  }

  return (
    <TouchableHighlight
      style={{
        position: 'absolute',
        width: '100%',
        height: 20,
        bottom: 0,
        backgroundColor: 'black',
      }}
      onPress={handleUpdate}>
      <>
        {!isUpdateAvailable && (
          <Text
            style={{
              color: 'white',
            }}>
            Revision: {Constants.manifest.releaseId ?? 'Unknown'}
          </Text>
        )}
        {isUpdateAvailable && (
          <Text
            style={{
              color: 'white',
            }}>
            Update available. Tap to reload.
          </Text>
        )}
      </>
    </TouchableHighlight>
  )
}
