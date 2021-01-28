import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import { Authenticated } from './Authenticated'
import { EnsureLocationPermission } from './EnsurePermission'
import { Locate } from './Locate'
import { NetReady } from './NetReady'
import { Store } from './Store'

export type PermissionCheckStatus =
  | 'unavailable'
  | 'blocked'
  | 'denied'
  | 'granted'
  | 'limited'

const App: FC = () => {
  return (
    <Store.Provider>
      <ThemeProvider>
        <View style={styles.container}>
          <EnsureLocationPermission>
            <Authenticated>
              <NetReady>
                <Locate />
              </NetReady>
            </Authenticated>
          </EnsureLocationPermission>
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
