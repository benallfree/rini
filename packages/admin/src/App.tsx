import firebase from 'firebase'
import React, { FC } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import './App.css'
import {
  FirebaseAuthProvider,
  FirebaseAuthConsumer,
} from '@react-firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCQrCIh-R6v-t0Qz-YWrnXRwsn-XhxVQgE',
  authDomain: 'rini-1234a.firebaseapp.com',
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
  projectId: 'rini-1234a',
  storageBucket: 'rini-1234a.appspot.com',
  messagingSenderId: '891246727316',
  appId: '1:891246727316:web:ac89f8e1ee6f4b8be4e481',
  measurementId: 'G-WB1XKBDS6G',
}

const uiConfig: firebaseui.auth.Config = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  callbacks: {
    signInSuccessWithAuthResult: (authResult) => {
      console.log('succsss', { authResult })
      return false
    },
  },
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInOptions: [firebase.auth.PhoneAuthProvider.PROVIDER_ID],
}

const Map: FC = () => {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup>
        <Marker position={[49.8397, 24.0297]} />
        <Marker position={[52.2297, 21.0122]} />
        <Marker position={[51.5074, -0.0901]} />
      </MarkerClusterGroup>
    </MapContainer>
  )
}
const App: FC = () => {
  return (
    <FirebaseAuthProvider {...firebaseConfig} firebase={firebase}>
      <div>
        <FirebaseAuthConsumer>
          {({ isSignedIn }) => {
            if (isSignedIn === true) {
              return <Map />
            }
            return (
              <StyledFirebaseAuth
                uiConfig={uiConfig}
                firebaseAuth={firebase.auth()}
              />
            )
          }}
        </FirebaseAuthConsumer>
      </div>
      <div>Another div</div>
    </FirebaseAuthProvider>
  )
}

export default App
