import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authService.verifyToken(token)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({
            type: 'AUTH_FAILURE',
            payload: error.message
          })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.login(credentials)
      localStorage.setItem('token', response.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response
      })
      return response
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message
      })
      throw error
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const response = await authService.register(userData)
      localStorage.setItem('token', response.token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response
      })
      return response
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
