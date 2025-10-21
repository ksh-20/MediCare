import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Pill, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Bot, 
  Camera, 
  Activity,
  X
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Elderly Patients', href: '/elderly', icon: Users },
  { name: 'Medications', href: '/medications', icon: Pill },
  { name: 'Schedule', href: '/medications/schedule', icon: Calendar },
  { name: 'Adherence', href: '/adherence', icon: Activity },
  { name: 'Alerts', href: '/adherence/alerts', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: FileText },
]

const aiFeatures = [
  { name: 'AI Chatbot', href: '/chatbot', icon: Bot },
  { name: 'Pill Scanner', href: '/pill-scanner', icon: Camera },
  { name: 'Fall Detection', href: '/fall-detection', icon: Activity },
]

function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MA</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">
              MediCare
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* AI Features */}
          <div className="space-y-1 mt-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              AI Features
            </div>
            {aiFeatures.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={onClose}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 mt-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Actions
            </div>
            <Link
              to="/elderly/new"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Add Patient
            </Link>
            <Link
              to="/medications/new"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <Pill className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Add Medication
            </Link>
            <Link
              to="/reports"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Generate Report
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            MediCare Assist v1.0.0
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
