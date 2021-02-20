import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import { Provider } from 'react-redux'
import { Authenticated } from './Authenticated'
import { Located } from './Located'
import { Map } from './Map'
import { store } from './Store'
import { Worker } from './Worker'

const App: FC = () => {
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
