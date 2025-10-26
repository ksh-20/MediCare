  import React, { useState } from 'react'
  import { Outlet } from 'react-router-dom'
  import Navbar from './Navbar'
  import Sidebar from './Sidebar'
  import { useNotification } from '../../hooks/useNotification'
  import { useEffect } from 'react'

  function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { connectSocket, disconnectSocket } = useNotification()

    useEffect(() => {
      // Connect to socket when layout mounts
      connectSocket()

      return () => {
        // Disconnect when layout unmounts
        disconnectSocket()
      }
    }, [connectSocket, disconnectSocket])

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          <main className="flex-1 lg:ml-64">
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
