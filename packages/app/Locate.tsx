import auth from '@react-native-firebase/auth'
import React, { FC } from 'react'
import { Button, Text } from 'react-native-elements'

export const Locate: FC = () => {
  return (
    <>
      {' '}
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
