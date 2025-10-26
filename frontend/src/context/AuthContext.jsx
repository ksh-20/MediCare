import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // ✅ Verify token on app mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.verifyToken(token)
          setUser(userData)
        } catch (err) {
          console.error('Token verification failed:', err.message)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        }
      }
      setLoading(false)
    }
    verifyUser()
  }, [])

  // AuthContext login
  const login = async (credentials) => {
    try {
      setError(null)
      const res = await authService.login(credentials) // { success, message, data }
      if (res.success && res.data?.token) {
        const { token, user } = res.data
        localStorage.setItem('token', token) // ✅ must store token
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        navigate('/dashboard', { replace: true })
      } else {
        alert(`❌ ${res.message || 'Login failed'}`)
      }
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  const register = async (userData) => {
    try {
      const res = await authService.register(userData)
      if (res.success) {
        alert('✅ Registered successfully! Please log in.')
        navigate('/login', { replace: true })
      } else {
        alert(`❌ ${res.message || 'Registration failed'}`)
      }
    } catch (err) {
      console.error('Register error:', err)
      alert(`❌ ${err.message || 'Registration failed'}`)
      setError(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
