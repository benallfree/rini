import { registerRootComponent } from 'expo'
import { StatusBar } from 'expo-status-bar'
import 'firebase/auth'
import React, { FC } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import MapView from 'react-native-maps'
import { Authenticated } from './Authenticated'
import { Store } from './Store'

const App: FC = () => {
  return (
    <Store.Provider>
      <ThemeProvider>
        <View style={styles.container}>
          <Authenticated>
            <StatusBar style="auto" />

            <MapView style={styles.map} />
          </Authenticated>
        </View>
      </ThemeProvider>
    </Store.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})

export default registerRootComponent(App)
