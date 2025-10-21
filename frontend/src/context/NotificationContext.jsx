import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const NotificationContext = createContext()

const initialState = {
  notifications: [],
  unreadCount: 0,
  socket: null,
  connected: false
}

function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        })),
        unreadCount: 0
      }
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    case 'SET_SOCKET':
      return {
        ...state,
        socket: action.payload
      }
    case 'SET_CONNECTED':
      return {
        ...state,
        connected: action.payload
      }
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    default:
      return state
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  useEffect(() => {
    // Initialize socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      autoConnect: false
    })

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true })
    })

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false })
    })

    socket.on('medication_reminder', (data) => {
      const notification = {
        id: Date.now(),
        type: 'medication_reminder',
        title: 'Medication Reminder',
        message: `Time to take ${data.medicationName}`,
        timestamp: new Date(),
        read: false,
        data
      }
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
      toast(notification.message, {
        icon: '💊',
        duration: 10000
      })
    })

    socket.on('missed_dose_alert', (data) => {
      const notification = {
        id: Date.now(),
        type: 'missed_dose',
        title: 'Missed Dose Alert',
        message: `${data.elderlyName} missed their ${data.medicationName} dose`,
        timestamp: new Date(),
        read: false,
        data
      }
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
      toast.error(notification.message, {
        duration: 15000
      })
    })

    socket.on('fall_detected', (data) => {
      const notification = {
        id: Date.now(),
        type: 'fall_detected',
        title: 'Fall Detection Alert',
        message: `Potential fall detected for ${data.elderlyName}`,
        timestamp: new Date(),
        read: false,
        data
      }
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
      toast.error(notification.message, {
        duration: 20000
      })
    })

    dispatch({ type: 'SET_SOCKET', payload: socket })

    return () => {
      socket.disconnect()
    }
  }, [])

  const connectSocket = () => {
    if (state.socket && !state.connected) {
      state.socket.connect()
    }
  }

  const disconnectSocket = () => {
    if (state.socket && state.connected) {
      state.socket.disconnect()
    }
  }

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId })
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
  }

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId })
  }

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  const addNotification = (notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
  }

  const value = {
    ...state,
    connectSocket,
    disconnectSocket,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}
