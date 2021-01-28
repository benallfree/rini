import auth from '@react-native-firebase/auth'
import React, { FC } from 'react'
import { Button, Text } from 'react-native-elements'
import RNLocation from 'react-native-location'

RNLocation.configure({
  distanceFilter: 5.0,
  allowsBackgroundLocationUpdates: true,
  showsBackgroundLocationIndicator: true,
})
export const Locate: FC = () => {
  RNLocation.requestPermission({
    ios: 'always',
    android: {
      detail: 'coarse',
    },
  }).then((granted) => {
    if (granted) {
      const locationSubscription = RNLocation.subscribeToLocationUpdates(
        (locations) => {
          console.log({ locations })
          /* Example location returned
          {
            speed: -1,
            longitude: -0.1337,
            latitude: 51.50998,
            accuracy: 5,
            heading: -1,
            altitude: 0,
            altitudeAccuracy: -1
            floor: 0
            timestamp: 1446007304457.029,
            fromMockProvider: false
          }
          */
        }
      )
    }
  })

  return (
    <>
      <Button
        title="Log Out"
        onPress={() =>
          auth()
            .signOut()
            .then(() => console.log('User signed out!'))
        }
      />
      <Text h1>Hello world</Text>
    </>
  )
}
