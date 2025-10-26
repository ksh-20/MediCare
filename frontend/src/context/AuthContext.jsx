import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // ✅ Verify token on mount
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
          setUser(null)
        }
      }
      setLoading(false)
    }
    verifyUser()
  }, [])

  // ✅ Login with fallback verify call
  const login = async (credentials) => {
    try {
      setError(null)
      const res = await authService.login(credentials) // res = { success, message, data }

      if (res.success && res.data?.token) {
        const { token, user } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        setUser(user)
        alert('✅ Login successful!')
        navigate('/dashboard', { replace: true })
      } else {
        alert(`❌ ${res.message || 'Login failed'}`)
      }
    } catch (err) {
      console.error('Login error:', err)
      alert(`❌ ${err.message || 'Login failed'}`)
      setError(err.message)
    }
  }

  const register = async (userData) => {
    try {
      const data = await authService.register(userData)
      alert('✅ Registered successfully! Please log in.')
      navigate('/login', { replace: true })
    } catch (error) {
      alert(`❌ ${error.message}`)
      setError(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
