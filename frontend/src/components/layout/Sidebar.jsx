import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Users, Pill, Calendar, AlertTriangle, FileText, Bot, Camera, Activity, X 
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: Home },
  { name: 'Elderly Patients', to: '/elderly', icon: Users },
  { name: 'Medications', to: '/medications', icon: Pill },
  { name: 'Schedule', to: '/medications/schedule', icon: Calendar },
  { name: 'Adherence', to: '/adherence', icon: Activity },
  { name: 'Alerts', to: '/adherence/alerts', icon: AlertTriangle },
  { name: 'Reports', to: '/reports', icon: FileText },
]

const aiFeatures = [
  { name: 'AI Chatbot', to: '/dashboard/ai/chatbot', icon: Bot },
  { name: 'Pill Scanner', to: '/dashboard/ai/pill', icon: Camera },
  { name: 'Fall Detection', to: '/dashboard/ai/fall', icon: Activity },
]

function Sidebar({ isOpen, onClose, isDarkMode }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className={clsx(
            'fixed inset-0 z-40 lg:hidden transition-opacity',
            isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'
          )} 
          onClick={onClose} 
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      )}>
        {/* Header */}
        <div className={clsx(
          'flex items-center justify-between h-16 px-4 border-b',
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        )}>
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MA</span>
            </div>
            <span className="ml-2 text-lg font-semibold">MediCare</span>
          </div>
          <button
            onClick={onClose}
            className={clsx(
              'lg:hidden p-2 rounded-md transition-colors',
              isDarkMode 
                ? 'text-gray-200 hover:bg-gray-700' 
                : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          {/* Main */}
          <div className="space-y-1">
            <div className={clsx(
              'px-3 py-2 text-xs font-semibold uppercase tracking-wider',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Main
            </div>
            {navigation.map(item => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* AI Features */}
          <div className="space-y-1 mt-8">
            <div className={clsx(
              'px-3 py-2 text-xs font-semibold uppercase tracking-wider',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              AI Features
            </div>
            {aiFeatures.map(item => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 mt-8">
            <div className={clsx(
              'px-3 py-2 text-xs font-semibold uppercase tracking-wider',
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            )}>
              Quick Actions
            </div>
            <NavLink
              to="/elderly/new"
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              onClick={onClose}
            >
              <Users className="mr-3 h-5 w-5" />
              Add Patient
            </NavLink>
            <NavLink
              to="/medications/new"
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              onClick={onClose}
            >
              <Pill className="mr-3 h-5 w-5" />
              Add Medication
            </NavLink>
            <NavLink
              to="/reports"
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              onClick={onClose}
            >
              <FileText className="mr-3 h-5 w-5" />
              Generate Report
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 p-4 text-center text-xs',
          isDarkMode ? 'border-t border-gray-700 text-gray-400' : 'border-t border-gray-200 text-gray-500'
        )}>
          MediCare Assist v1.0.0
        </div>
      </div>
    </>
  )
}

export default Sidebar
