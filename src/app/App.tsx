import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Provider } from 'react-redux'
import { Root } from './components/Root'
import { makeStore } from './store'

export const store = makeStore()

const App: FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Provider store={store}>
        <Root />
      </Provider>
    </View>
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
