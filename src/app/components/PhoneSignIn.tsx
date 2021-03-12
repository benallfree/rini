import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'
import firebase from 'firebase'
import React, { FC, useCallback, useRef, useState } from 'react'
import { Button as RNEButton, Input, Text } from 'react-native-elements'
import PhoneInput from 'react-native-phone-number-input'
import { auth, firebaseConfig } from '../firebase'
import { useIsOnline } from '../hooks/store/useIsOnline'

const Button: FC<{ title: string; onPress: () => void }> = (props) => {
  const { onPress, title } = props
  return (
    <RNEButton
      title={title}
      onPress={onPress}
      containerStyle={{ width: '100%', padding: 20 }}
      buttonStyle={{ padding: 20 }}
    />
  )
}

export const PhoneSignIn: FC = () => {
  // If null, no SMS has been sent
  const [verificationId, setVerificationId] = useState<string>()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')
  const fbAuthRef = useRef<FirebaseRecaptchaVerifierModal>(null)
  const [code, setCode] = useState('')
  const phoneInput = useRef<PhoneInput>(null)
  const isOnline = useIsOnline()
  const [error, setError] = useState('')
  const [stage, setStage] = useState<'phoneInput' | 'verifying' | 'confirmInput' | 'confirming'>(
    'phoneInput'
  )

  // Handle the button press
  const signInWithPhoneNumber = useCallback(
    (phoneNumber: string) => {
      if (!fbAuthRef.current) {
        throw new Error('Firebase auth modal not ready')
      }
      const phoneProvider = new firebase.auth.PhoneAuthProvider()
      console.log('provider', phoneNumber)
      setError('')
      if (!isOnline) {
        setTimeout(() => setError(`You must have an Internet connection to log in.`), 500)
        return
      }
      setStage('verifying')
      phoneProvider
        .verifyPhoneNumber(phoneNumber, fbAuthRef.current)
        .then((verificationId) => {
          console.log('finished')
          setStage('confirmInput')
          setVerificationId(verificationId)
        })
        .catch((e) => {
          console.error(e)

          setStage('phoneInput')
          setError(
            `There was a problem sending your verification code. Please check your number and try again`
          )
        })
    },
    [isOnline]
  )

  const confirmCode = useCallback(() => {
    if (!verificationId) {
      throw new Error(`No verification ID`)
    }
    setError('')
    if (!isOnline) {
      setTimeout(() => setError(`You must have an Internet connection to log in.`), 500)
      return
    }
    console.log('confirming')
    setStage('confirming')
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code)

    auth
      .signInWithCredential(credential)
      .then(() => {
        console.log('sign in success')
      })
      .catch((e) => {
        console.log(e)
        setError(`Confrmation code was invalid. Try again.`)
      })
  }, [code, verificationId, isOnline])

  return (
    <>
      <Text h4 style={{ color: 'red' }}>
        {error}
      </Text>
      <FirebaseRecaptchaVerifierModal
        ref={fbAuthRef}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />
      {stage === 'phoneInput' && (
        <>
          <Text h3 style={{ textAlign: 'center', marginBottom: 50 }}>
            Rini needs to verify your device before continuing. This usually is only needed once.
          </Text>
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
          <Button title="Sign In" onPress={() => signInWithPhoneNumber(formattedPhoneNumber)} />
        </>
      )}

      {stage === 'verifying' && (
        <>
          <Text h1>Rini is sending your confirmation code...</Text>
          <Button
            onPress={() => {
              setStage('phoneInput')
              setError('')
            }}
            title="I didn't get it"
          />
        </>
      )}

      {stage === 'confirmInput' && (
        <>
          <Text h1 style={{ marginBottom: 50 }}>
            Rini sent an SMS message with your confirmation code...
          </Text>
          <Input
            keyboardType={'number-pad'}
            style={{ fontSize: 50, textAlign: 'center' }}
            placeholder="123456"
            value={code}
            onChangeText={(text) => setCode(text.trim())}
          />
          <Button title="Confirm Code" onPress={() => confirmCode()} />
          <Button
            onPress={() => {
              setStage('phoneInput')
              setError('')
            }}
            title="I didn't get it"
          />
        </>
      )}

      {stage === 'confirming' && (
        <>
          <Text h1>Logging in...</Text>
          <Button
            onPress={() => {
              setStage('phoneInput')
              setError('')
            }}
            title="I didn't get it"
          />
        </>
      )}
    </>
  )
}
