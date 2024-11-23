import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4-eYJdOYDPONovgJil9akHHE60EsGHDU",
  authDomain: "to-do-app-375cf.firebaseapp.com",
  projectId: "to-do-app-375cf",
  storageBucket: "to-do-app-375cf.firebasestorage.app",
  messagingSenderId: "955144883900",
  appId: "1:955144883900:web:44a216c643a2b1217e4ab9",
  measurementId: "G-BKV0E7002B"
}

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
