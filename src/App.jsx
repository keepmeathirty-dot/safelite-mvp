import { useState, useEffect } from 'react'
import Login from './Login.jsx'
import Home from './Home.jsx'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('safelite_user')
    if (saved) setUser(saved)
  }, [])

  function handleLogin(phone) {
    localStorage.setItem('safelite_user', phone)
    setUser(phone)
  }

  function handleLogout() {
    localStorage.removeItem('safelite_user')
    setUser(null)
  }

  return user
    ? <Home phone={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />
}
