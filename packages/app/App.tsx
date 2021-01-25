import auth from '@react-native-firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, ThemeProvider } from 'react-native-elements'
import { Authenticated } from './Authenticated'

const App: FC = () => {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Authenticated>
          <Button
            title="Log Out"
            onPress={() =>
              auth()
                .signOut()
                .then(() => console.log('User signed out!'))
            }
          />
          <Text h1>Hello world</Text>
        </Authenticated>
      </View>
    </ThemeProvider>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
