import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useNotification } from '../../hooks/useNotification'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { connectSocket, disconnectSocket } = useNotification()

  // Connect to notifications socket
  useEffect(() => {
    connectSocket()
    return () => disconnectSocket()
  }, [connectSocket, disconnectSocket])

  // Update HTML class for Tailwind dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(prev => !prev)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <div className="flex" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDarkMode={isDarkMode}
        />

        {/* Main content */}
        <main className="flex-1 lg:ml-64 transition-colors duration-300" style={{ width: '100%' }}>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
