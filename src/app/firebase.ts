import * as firebase from 'firebase'

//import "firebase/database";
//import "firebase/firestore";
//import "firebase/functions";
//import "firebase/storage";
// Initialize Firebase

export const firebaseConfig = {
  apiKey: 'AIzaSyCQrCIh-R6v-t0Qz-YWrnXRwsn-XhxVQgE',
  authDomain: 'rini-1234a.firebaseapp.com',
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
  projectId: 'rini-1234a',
  storageBucket: 'rini-1234a.appspot.com',
  messagingSenderId: '891246727316',
  appId: '1:891246727316:web:ac89f8e1ee6f4b8be4e481',
  measurementId: 'G-WB1XKBDS6G',
  trackingId: 'foo',
}
firebase.initializeApp(firebaseConfig)

const db = firebase.database()
const auth = firebase.auth()
export { db, auth }
