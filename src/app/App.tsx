import { registerRootComponent } from 'expo'
import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-elements'
import { Provider } from 'react-redux'
import { InternetCheck } from './components/InternetCheck'
import { Root } from './components/Root'
import { engine } from './engine'

const App: FC = () => {
  return (
    <Provider store={engine.store}>
      <InternetCheck>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Root />

          <Text
            style={{
              position: 'absolute',
              width: '100%',
              height: 30,
              bottom: 10,
              backgroundColor: 'black',
              color: 'white',
            }}>
            Revision: {Constants.manifest.releaseId}
          </Text>
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
