import React from 'react'
import { Users, Pill, AlertTriangle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

function StatCards({ stats }) {
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalElderly,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase',
      description: 'Elderly patients under care'
    },
    {
      title: 'Active Medications',
      value: stats.totalMedications,
      icon: Pill,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+5%',
      changeType: 'increase',
      description: 'Medications being tracked'
    },
    {
      title: 'Active Alerts',
      value: stats.activeAlerts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-2',
      changeType: 'decrease',
      description: 'Missed doses and alerts'
    },
    {
      title: 'Adherence Rate',
      value: `${stats.adherenceRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+3%',
      changeType: 'increase',
      description: 'Overall medication adherence'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className="card hover:shadow-md transition-shadow">
          <div className="card-body">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  {stat.title}
                </p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="ml-2 flex items-baseline text-sm">
                    {stat.changeType === 'increase' ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`ml-1 ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatCards
