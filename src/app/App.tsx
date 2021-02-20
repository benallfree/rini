import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import { Provider } from 'react-redux'
import { Authenticated } from './components/Authenticated'
import { Located } from './components/Located'
import { Map } from './components/Map'
import { Worker } from './components/Worker'
import { store } from './store'

const App: FC = () => {
  console.log('render')
  return (
    <View style={styles.container}>
      <Provider store={store}>
        <ThemeProvider>
          <Located>
            <Authenticated>
              <StatusBar style="auto" />
              <Map />
            </Authenticated>
          </Located>
        </ThemeProvider>
        <Worker />
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
