import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import React, { FC, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import MapView from 'react-native-maps'
import { Message, useWebWorker } from './rn-webworker'
import workerJs from './worker.inlined'

const App: FC = () => {
  const [messages, setMessages] = useState<Message[]>([])

  const { WebWorker, send, onMessage } = useWebWorker(workerJs)

  useEffect(() => {
    const unsub = onMessage((msg) => {
      console.log('Rx worker->main', { msg })
      setMessages([...messages, msg])
    })
    return unsub
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <MapView style={styles.map} />
      <WebWorker />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})

export default registerRootComponent(App)
