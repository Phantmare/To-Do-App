import React, { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from "firebase/firestore"
import { db } from "./firebaseConfig"

export default function ToDoApp() {
  const { logout, user, isAuthenticated } = useAuth0()
  const [toDoApp, setToDoApp] = useState([])
  const [userInput, setUserInput] = useState("")
  const [categoryInput, setCategoryInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [taskBeingEdited, setTaskBeingEdited] = useState(null)
  const [editedTaskInput, setEditedTaskInput] = useState("")

  const userId = isAuthenticated ? user.email : null

  useEffect(function() {
    if (isAuthenticated) {
      fetchTasks()
      fetchCategories()
    }
  }, [isAuthenticated])

  function fetchTasks() {
    if (!userId) return
    const tasksRef = collection(db, "users", userId, "tasks")
    getDocs(tasksRef).then(function(querySnapshot) {
      const tasks = querySnapshot.docs.map(function(doc) {
        return { id: doc.id, ...doc.data() }
      })
      setToDoApp(tasks)
    })
  }

  function fetchCategories() {
    if (!userId) return
    const categoriesRef = collection(db, "users", userId, "categories")
    getDocs(categoriesRef).then(function(querySnapshot) {
      const fetchedCategories = querySnapshot.docs.map(function(doc) {
        return doc.data().name
      })
      setCategories(fetchedCategories)
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (userInput.trim() && selectedCategory) {
      const newTask = { description: userInput, category: selectedCategory }
      const tasksRef = collection(db, "users", userId, "tasks")
      addDoc(tasksRef, newTask).then(function(docRef) {
        setToDoApp([...toDoApp, { id: docRef.id, ...newTask }])
        setUserInput("")
      }).catch(function(e) {
        console.error("Error adding task: ", e)
      })
    }
  }

  function handleAddCategory(e) {
    e.preventDefault()
    if (categoryInput.trim() && !categories.includes(categoryInput)) {
      const newCategory = { name: categoryInput }
      const categoriesRef = collection(db, "users", userId, "categories")
      addDoc(categoriesRef, newCategory).then(function() {
        setCategories([...categories, categoryInput])
        setCategoryInput("")
      }).catch(function(e) {
        console.error("Error adding category: ", e)
      })
    }
  }

  function handleSubmitEdit(e) {
    e.preventDefault()
    const taskRef = doc(db, "users", userId, "tasks", taskBeingEdited)
    updateDoc(taskRef, { description: editedTaskInput }).then(function() {
      setToDoApp(toDoApp.map(function(task) {
        return task.id === taskBeingEdited ? { ...task, description: editedTaskInput } : task
      }))
      setTaskBeingEdited(null)
      setEditedTaskInput("")
    }).catch(function(e) {
      console.error("Error updating task: ", e)
    })
  }

  function handleDeleteTask(taskId) {
    const taskRef = doc(db, "users", userId, "tasks", taskId)
    deleteDoc(taskRef).then(function() {
      setToDoApp(toDoApp.filter(function(task) {
        return task.id !== taskId
      }))
    }).catch(function(e) {
      console.error("Error deleting task: ", e)
    })
  }

  function handleDeleteCategory(category) {
    setCategories(categories.filter(function(cat) {
      return cat !== category
    }))
    setToDoApp(toDoApp.filter(function(task) {
      return task.category !== category
    }))
    const tasksRef = collection(db, "users", userId, "tasks")
    getDocs(tasksRef).then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if (doc.data().category === category) {
          deleteDoc(doc.ref)
        }
      })
    }).catch(function(e) {
      console.error("Error deleting category: ", e)
    })

    const categoriesRef = collection(db, "users", userId, "categories")
    getDocs(categoriesRef).then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        if (doc.data().name === category) {
          deleteDoc(doc.ref)
        }
      })
    }).catch(function(e) {
      console.error("Error deleting category from Firestore: ", e)
    })
  }

  const filteredTasks = selectedCategory
    ? toDoApp.filter(function(task) {
      return task.category === selectedCategory
    })
    : toDoApp

  const isAddTaskDisabled = !selectedCategory
  const showWarning = isAddTaskDisabled

  return (
    <div className="to-do-app">
      {isAuthenticated && (
        <div className="user-info">
          <h3>Welcome, {user.name}!</h3>
          <button onClick={function() { logout({ returnTo: window.location.origin }) }}>
            Log Out
          </button>
        </div>
      )}

      <form className="category-form" onSubmit={handleAddCategory}>
        <input
          value={categoryInput}
          onChange={function(e) { setCategoryInput(e.target.value) }}
          type="text"
          placeholder="New Category"
        />
        <button type="submit">Add Category</button>
      </form>

      <div className="categories">
        <h3>Categories:</h3>
        <ul>
          {categories.map(function(category, index) {
            return (
              <li key={index}>
                {category}{" "}
                <button onClick={function() { handleDeleteCategory(category) }}>Delete</button>
              </li>
            )
          })}
        </ul>
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          value={userInput}
          onChange={function(e) { setUserInput(e.target.value) }}
          type="text"
          placeholder="New Task"
        />
        <select onChange={function(e) { setSelectedCategory(e.target.value) }} value={selectedCategory}>
          <option value="">Select Category</option>
          {categories.map(function(category, index) {
            return (
              <option key={index} value={category}>{category}</option>
            )
          })}
        </select>
        <button type="submit" disabled={isAddTaskDisabled}>
          Add Task
        </button>
      </form>

      {showWarning && (
        <p style={{ color: "red", fontSize: "12px" }}>
          Please select a category and enter a task.
        </p>
      )}

      <ul>
        {filteredTasks.map(function(task) {
          return (
            <li key={task.id}>
              {taskBeingEdited === task.id ? (
                <form onSubmit={handleSubmitEdit}>
                  <input
                    value={editedTaskInput}
                    onChange={function(e) { setEditedTaskInput(e.target.value) }}
                  />
                  <button type="submit">Save</button>
                  <button onClick={function() { setTaskBeingEdited(null) }}>Cancel</button>
                </form>
              ) : (
                <>
                  <span>{task.description} - {task.category}</span> 
                  <button onClick={function() { setTaskBeingEdited(task.id) }}>Edit</button>
                  <button onClick={function() { handleDeleteTask(task.id) }}>Delete</button>
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
