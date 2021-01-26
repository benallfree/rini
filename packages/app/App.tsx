import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import { Authenticated } from './Authenticated'
import { Locate } from './Locate'
import { NetReady } from './NetReady'
import { Store } from './Store'

const App: FC = () => {
  return (
    <Store.Provider>
      <ThemeProvider>
        <View style={styles.container}>
          <Authenticated>
            <NetReady>
              <Locate />
            </NetReady>
          </Authenticated>
        </View>
      </ThemeProvider>
    </Store.Provider>
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
