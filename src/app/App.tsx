import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Provider } from 'react-redux'
import { InternetCheck } from './components/InternetCheck'
import { Root } from './components/Root'
import { DebugBar } from './DebugBar'
import { engine } from './engine'

const App: FC = () => {
  return (
    <Provider store={engine.store}>
      <InternetCheck>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Root />
          <DebugBar />
        </View>
      </InternetCheck>
    </Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default registerRootComponent(App)
