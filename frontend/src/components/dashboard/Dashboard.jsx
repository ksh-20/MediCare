import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCards from './StatCards'
import AdherenceChart from './AdherenceChart'
import { elderlyService } from '../../services/elderlyService'
import { medicationService } from '../../services/medicationService'
import { Users, Pill, AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { dateHelpers } from '../../utils/dateHelpers'
import toast from 'react-hot-toast'

function Dashboard() {
  const [stats, setStats] = useState({
    totalElderly: 0,
    totalMedications: 0,
    activeAlerts: 0,
    adherenceRate: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingMedications, setUpcomingMedications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load elderly patients
      const elderlyData = await elderlyService.getAllElderly()
      
      // Load medications
      const medicationsData = await medicationService.getAllMedications()
      
      // Calculate stats
      const totalElderly = elderlyData.length
      const totalMedications = medicationsData.length
      
      // Mock data for demonstration
      const activeAlerts = Math.floor(Math.random() * 10)
      const adherenceRate = Math.floor(Math.random() * 30) + 70 // 70-100%
      
      setStats({
        totalElderly,
        totalMedications,
        activeAlerts,
        adherenceRate
      })

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          type: 'medication_taken',
          message: 'John Doe took his morning medication',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          icon: CheckCircle,
          color: 'text-green-500'
        },
        {
          id: 2,
          type: 'missed_dose',
          message: 'Jane Smith missed her evening medication',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: AlertTriangle,
          color: 'text-red-500'
        },
        {
          id: 3,
          type: 'new_patient',
          message: 'New patient Robert Johnson added',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          icon: Users,
          color: 'text-blue-500'
        },
        {
          id: 4,
          type: 'medication_scheduled',
          message: 'Medication schedule updated for Mary Wilson',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          icon: Pill,
          color: 'text-purple-500'
        }
      ])

      // Mock upcoming medications
      setUpcomingMedications([
        {
          id: 1,
          elderlyName: 'John Doe',
          medicationName: 'Lisinopril 10mg',
          scheduledTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
          status: 'upcoming'
        },
        {
          id: 2,
          elderlyName: 'Jane Smith',
          medicationName: 'Metformin 500mg',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          status: 'upcoming'
        },
        {
          id: 3,
          elderlyName: 'Robert Johnson',
          medicationName: 'Atorvastatin 20mg',
          scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          status: 'upcoming'
        }
      ])

    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your elderly patients.
        </p>
      </div>

      {/* Stats Cards */}
      <StatCards stats={stats} />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adherence Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Medication Adherence</h3>
            <p className="mt-1 text-sm text-gray-500">Last 7 days</p>
          </div>
          <div className="card-body">
            <AdherenceChart />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <Link 
              to="/adherence" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 ${activity.color}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {dateHelpers.getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Medications */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Medications</h3>
          <Link 
            to="/medications/schedule" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View schedule
          </Link>
        </div>
        <div className="card-body">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingMedications.map((medication) => (
                  <tr key={medication.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {medication.elderlyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.medicationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dateHelpers.formatDateTime(medication.scheduledTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Upcoming
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/elderly/new"
          className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">Add New Patient</h3>
            <p className="text-sm text-gray-500">Register a new elderly patient</p>
          </div>
        </Link>

        <Link
          to="/medications/new"
          className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <Pill className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">Add Medication</h3>
            <p className="text-sm text-gray-500">Create a new medication schedule</p>
          </div>
        </Link>

        <Link
          to="/reports"
          className="flex items-center p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-900">Generate Report</h3>
            <p className="text-sm text-gray-500">Create detailed reports</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
