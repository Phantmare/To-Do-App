import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebaseConfig"

export default function ToDoApp() {
  const { user, logout, isAuthenticated } = useAuth0()
  const [categories, setCategories] = useState([])
  const [categoryInput, setCategoryInput] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [tasks, setTasks] = useState({})
  const [warningMessage, setWarningMessage] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [editedTaskValue, setEditedTaskValue] = useState('')


  useEffect(() => {
    if (isAuthenticated && user) {
      checkAndLoadUserData(user.email)
    }
  }, [isAuthenticated, user])

  function checkAndLoadUserData(email) {
    const userRef = doc(db, "users", email)
    getDoc(userRef).then(docSnap => {
      if (!docSnap.exists()) {
        setDoc(userRef, {
          email: email,
          createdAt: new Date(),
          categories: [],
          tasks: {}
        }).catch((error) => {
          console.error("Error creating user in Firestore:", error)
        })
      } else {
        const userData = docSnap.data()
        setCategories(userData.categories || [])
        setTasks(userData.tasks || {})
      }
    }).catch((error) => {
      console.error("Error checking user in Firestore:", error)
    })
  }

  function addCategory() {
    if (categoryInput && !categories.includes(categoryInput)) {
      const newCategories = [...categories, categoryInput]
      setCategories(newCategories)
      setTasks({ ...tasks, [categoryInput]: [] })
      updateUserData({ categories: newCategories, tasks })
      setCategoryInput('')
    }
  }

  function removeCategory(category) {
    const newCategories = categories.filter(cat => cat !== category)
    const newTasks = { ...tasks }
    delete newTasks[category]
    setCategories(newCategories)
    setTasks(newTasks)
    updateUserData({ categories: newCategories, tasks: newTasks })
    if (selectedCategory === category) {
      setSelectedCategory('')
    }
  }

  function addTask() {
    if (!selectedCategory) {
      setWarningMessage('Please select a category to add a task')
      return
    }
    if (taskInput) {
      const newTasks = { ...tasks, [selectedCategory]: [...tasks[selectedCategory], taskInput] }
      setTasks(newTasks)
      updateUserData({ categories, tasks: newTasks })
      setTaskInput('')
      setWarningMessage('')
    }
  }

  function removeTask(task, category) {
    const updatedTasks = tasks[category].filter(t => t !== task)
    setTasks({ ...tasks, [category]: updatedTasks })
    updateUserData({ categories, tasks: { ...tasks, [category]: updatedTasks } })
  }

  function startEditingTask(task, category) {
    setEditingTask({ task: task, category: category })
    setEditedTaskValue(task)
  }

  function saveEditedTask(category) {
    const updatedTasks = tasks[category].map(task => task === editingTask.task ? editedTaskValue : task)
    setTasks({ ...tasks, [category]: updatedTasks })
    updateUserData({ categories, tasks: { ...tasks, [category]: updatedTasks } })
    setEditingTask(null)
    setEditedTaskValue('')
  }

  function cancelEditing() {
    setEditingTask(null)
    setEditedTaskValue('')
  }

  function updateUserData(data) {
    if (user) {
      const userRef = doc(db, "users", user.email)
      updateDoc(userRef, data).catch((error) => {
        console.error("Error updating user data:", error)
      })
    }
  }

  return (
    <div className="to-do-app">
      {isAuthenticated && user && (
        <div className="user-info">
          <h3>Welcome, {user.email}!</h3>
          <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
        </div>
      )}

      <h3>To-Do List</h3>

      <form onSubmit={(e) => {
        e.preventDefault()
        addCategory()
      }}>
        <input
          type="text"
          placeholder="New Category"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
        />
        <button type="submit">Add Category</button>
      </form>

      <div className="categories">
        <ul>
          {categories.map(category => (
            <li key={category}>
              {category}
              <button onClick={() => removeCategory(category)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      {categories.length > 0 && (
        <div className="task-form">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New Task"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <button onClick={addTask}>Add Task</button>
          {warningMessage && <p style={{ color: 'red' }}>{warningMessage}</p>}
        </div>
      )}

      {selectedCategory && (
        <div>
          <h4>{selectedCategory} Tasks</h4>
          <ul>
            {tasks[selectedCategory]?.map((task, index) => (
              <li key={index}>
                {editingTask?.task === task ? (
                  <div>
                    <input
                      type="text"
                      value={editedTaskValue}
                      onChange={(e) => setEditedTaskValue(e.target.value)}
                    />
                    <button onClick={() => saveEditedTask(selectedCategory)}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <span>{task}</span>
                    <button onClick={() => startEditingTask(task, selectedCategory)}>Edit Task</button>
                    <button onClick={() => removeTask(task, selectedCategory)}>Remove Task</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
