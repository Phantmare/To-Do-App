import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'

export default function Auth() {
  const { loginWithPopup, loginWithRedirect, user, isAuthenticated } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      checkAndCreateUser(user.email)
      navigate('/todo')
    }
  }, [isAuthenticated, navigate, user])

  function checkAndCreateUser(email) {
    const userRef = doc(db, "users", email) 
    getDoc(userRef).then(docSnap => {
      if (!docSnap.exists()) {
        setDoc(userRef, {
          email: email,
          createdAt: new Date()
        }).then(() => {
          console.log("User created in Firestore:", email)
        }).catch((error) => {
          console.error("Error creating user in Firestore:", error)
        })
      }
    }).catch((error) => {
      console.error("Error checking user in Firestore:", error)
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>To-Do App Authentication</h1>
        <div className="auth-buttons">
          <button onClick={loginWithPopup} className="auth-button">Login with Popup</button>
          <button onClick={loginWithRedirect} className="auth-button">Login with Redirect</button>
        </div>
        <h3>User is {isAuthenticated ? "Logged in" : "Not logged in"}</h3>
        {isAuthenticated && 
          <pre className="user-info">{JSON.stringify(user, null, 2)}</pre>
        }
      </div>
    </div>
  )
}
