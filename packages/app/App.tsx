import auth from '@react-native-firebase/auth'
import React, { FC, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, ThemeProvider } from 'react-native-elements'
import dgram from 'react-native-udp'
import { Authenticated } from './Authenticated'

function randomPort() {
  return (Math.random() * 60536) | (0 + 5000) // 60536-65536
}

const App: FC = () => {
  useEffect(() => {
    console.log('useEffect')
    const socket = dgram.createSocket({ type: 'udp4' })
    const port = randomPort()
    const address = '192.168.1.19'
    socket.bind(port)
    socket.once('listening', () => {
      console.log('listening for messages')

      socket.send(
        'Hello World!',
        undefined,
        undefined,
        41234,
        address,
        function (err) {
          if (err) throw err

          console.log('Message sent!')
        }
      )
    })

    socket.on('message', (msg, rinfo) => {
      console.log('Message receiveddd', { msg, rinfo })
    })
    return () => {
      socket.close()
    }
  }, [])

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
