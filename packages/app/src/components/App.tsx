import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeProvider } from 'react-native-elements'
import { Store } from '../Store'
import { Authenticated } from './Authenticated'
import { EnsureLocationPermission } from './EnsurePermission'
import { Locate } from './Locate'
import { NetReady } from './NetReady'

export type PermissionCheckStatus =
  | 'unavailable'
  | 'blocked'
  | 'denied'
  | 'granted'
  | 'limited'

const EnsureBadge: FC = ({ children }) => {
  return <>{children}</>
}

const App: FC = () => {
  return (
    <Store.Provider>
      <ThemeProvider>
        <View style={styles.container}>
          <EnsureLocationPermission>
            <Authenticated>
              <EnsureBadge>
                <NetReady>
                  <Locate />
                </NetReady>
              </EnsureBadge>
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
