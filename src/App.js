import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Auth from './Auth'
import TodoApp from './ToDoApp'
import { PrivateRoute } from './PrivateRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route
          path="/todo"
          element={
            <PrivateRoute>
              <TodoApp />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
