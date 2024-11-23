import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import Auth from './Auth'
import TodoApp from './ToDoApp'

function App() {
  const { isAuthenticated } = useAuth0()

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/todo"
          element={isAuthenticated ? <TodoApp /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  )
}

export default App
