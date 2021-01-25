import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Input, Text, ThemeProvider } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'

function PhoneSignIn() {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult>()

  const [code, setCode] = useState('')

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber: string) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber)
    setConfirm(confirmation)
  }

  const confirmCode = useCallback(async () => {
    if (!confirm) return
    try {
      await confirm.confirm(code)
    } catch (error) {
      console.log('Invalid code.', error)
      setConfirm(undefined)
    }
  }, [confirm, code])

  if (!confirm) {
    return (
      <Button
        title="Phone Number Sign In"
        onPress={() => signInWithPhoneNumber('+1 805-403-2380')}
      />
    )
  }

  return (
    <>
      <Input
        placeholder="1234"
        value={code}
        onChangeText={(text) => setCode(text)}
      />
      <Button
        icon={<Icon name="arrow-right" size={15} color="white" />}
        title="Confirm Code"
        onPress={() => confirmCode()}
      />
    </>
  )
}

const Authenticated: FC = ({ children }) => {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    (user: FirebaseAuthTypes.User | null) => {
      setUser(user)
      if (initializing) setInitializing(false)
    },
    [initializing]
  )

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [onAuthStateChanged])

  if (initializing) return null

  if (!user) {
    return <PhoneSignIn />
  }

  return children
}

const App: FC = () => {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <Authenticated>
          <Text h1>Hello world</Text>
        </Authenticated>
      </View>
    </ThemeProvider>
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
