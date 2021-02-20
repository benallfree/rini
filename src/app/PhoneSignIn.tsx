import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'
import firebase from 'firebase'
import React, { useCallback, useRef, useState } from 'react'
import { Button, Input } from 'react-native-elements'
import PhoneInput from 'react-native-phone-number-input'
import Icon from 'react-native-vector-icons/FontAwesome'
import { firebaseConfig } from './firebase'

export function PhoneSignIn() {
  // If null, no SMS has been sent
  const [verificationId, setVerificationId] = useState<string>()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const fbAuthRef = useRef<FirebaseRecaptchaVerifierModal>(null)
  const [code, setCode] = useState('')
  const phoneInput = useRef<PhoneInput>(null)

  // Handle the button press
  const signInWithPhoneNumber = useCallback(
    async (phoneNumber: string) => {
      if (!fbAuthRef.current) {
        throw new Error('Firebase auth modal not ready')
      }
      const phoneProvider = new firebase.auth.PhoneAuthProvider()
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        fbAuthRef.current
      )

      setVerificationId(verificationId)
    },
    [fbAuthRef.current]
  )

  const confirmCode = useCallback(async () => {
    if (!verificationId) {
      throw new Error(`No verification ID`)
    }
    const credential = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      code
    )
    firebase.auth().signInWithCredential(credential)
  }, [code])

  if (!verificationId) {
    return (
      <>
        <FirebaseRecaptchaVerifierModal
          ref={fbAuthRef}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification={true}
        />
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
        onChangeText={(text) => setCode(text.trim())}
      />
      <Button
        icon={<Icon name="arrow-right" size={15} color="white" />}
        title="Confirm Code"
        onPress={() => confirmCode()}
      />
    </>
  )
}
