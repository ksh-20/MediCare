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
  // { name: 'AI Dashboard', to: '/dashboard/ai', icon: Bot },
  { name: 'AI Chatbot', to: '/dashboard/ai/chatbot', icon: Bot },
  { name: 'Pill Scanner', to: '/dashboard/ai/pill', icon: Camera },
  { name: 'Fall Detection', to: '/dashboard/ai/fall', icon: Activity },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50" 
          onClick={onClose} 
        />
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
            <span className="ml-2 text-lg font-semibold text-gray-900">MediCare</span>
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
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</div>
            {navigation.map(item => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* AI Features */}
          <div className="space-y-1 mt-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                      ? 'bg-blue-200 text-blue-900 font-semibold' // active AI link style
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                onClick={onClose}
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 mt-8">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</div>
            <NavLink
              to="/elderly/new"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Add Patient
            </NavLink>
            <NavLink
              to="/medications/new"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <Pill className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Add Medication
            </NavLink>
            <NavLink
              to="/reports"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              onClick={onClose}
            >
              <FileText className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Generate Report
            </NavLink>
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-center text-xs text-gray-500">
          MediCare Assist v1.0.0
        </div>
      </div>
    </>
  )
}

export default Sidebar