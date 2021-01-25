import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { useCallback, useRef, useState } from 'react'
import { Button, Input } from 'react-native-elements'
import PhoneInput from 'react-native-phone-number-input'
import Icon from 'react-native-vector-icons/FontAwesome'

export function PhoneSignIn() {
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
