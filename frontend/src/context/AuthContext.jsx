import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'


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

      // Call backend login
      const res = await authService.login(credentials)

      // Determine where the token and user are
      const token = res?.data?.token || res?.token
      const user = res?.data?.user || res?.user

      if (token && user) {
        // Store token & user in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        // Update context state
        setUser(user)

        // Navigate to dashboard
        navigate('/dashboard', { replace: true })
        // toast.success('✅ Successfully logged in!')
      } else {
        const message = res?.message || 'Login failed: invalid response from server'
        setError(message)
        toast.error(`❌ ${message}`)
      }
    } catch (err) {
      // Handles both Axios errors and unexpected errors
      const message = err.response?.data?.message || err.message || 'Login failed'
      console.error('Login error:', err)
      setError(message)
      toast.error(`❌ ${message}`)
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
