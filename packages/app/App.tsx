import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Input, Text, ThemeProvider } from 'react-native-elements'
import PhoneInput from 'react-native-phone-number-input'
import Icon from 'react-native-vector-icons/FontAwesome'

function PhoneSignIn() {
  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult>()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')

  const [code, setCode] = useState('')
  const phoneInput = useRef<PhoneInput>(null)

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
      <>
        <PhoneInput
          ref={phoneInput}
          defaultValue={phoneNumber}
          defaultCode="US"
          layout="first"
          onChangeText={(text) => {
            setPhoneNumber(text)
          }}
          onChangeFormattedText={(text) => {
            setFormattedPhoneNumber(text)
          }}
          withDarkTheme
          withShadow
          autoFocus
        />
        <Button
          title="Sign In"
          containerStyle={{ width: '100%' }}
          style={{ margin: 15 }}
          onPress={() => signInWithPhoneNumber(formattedPhoneNumber)}
        />
      </>
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
          <Button
            title="Log Out"
            onPress={() =>
              auth()
                .signOut()
                .then(() => console.log('User signed out!'))
            }
          />
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
