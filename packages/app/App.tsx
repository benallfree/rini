import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Input, ThemeProvider } from 'react-native-elements'
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
      console.log('Invalid code.')
    }
  }, [confirm])

  if (!confirm) {
    return (
      <Button
        title="Phone Number Sign In"
        onPress={() => signInWithPhoneNumber('+1 805-403-2380')}
      />
    )
  }

  console.log('hey')

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

export default function App() {
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <PhoneSignIn />
      </View>
    </ThemeProvider>
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
