import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { elderlyService } from '../../services/elderlyService'
import toast from 'react-hot-toast'

const MissedDoseAlerts = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [elderly, setElderly] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    severity: 'all',
    elderlyId: 'all',
    timeRange: '24h'
  })

  useEffect(() => {
    loadAlerts()
  }, [filters])

  const loadAlerts = async () => {
    try {
      setLoading(true)

      // Ensure elderlyData is always an array
      const elderlyDataRaw = await elderlyService.getAllElderly()
      const elderlyData = Array.isArray(elderlyDataRaw) ? elderlyDataRaw : []
      setElderly(elderlyData)

      const allAlerts = []

      for (const patient of elderlyData) {
        try {
          const adherenceDataRaw = await elderlyService.getElderlyAdherence(patient._id, {
            startDate: getStartDate(),
            endDate: new Date().toISOString().split('T')[0]
          })

          // Ensure recentLogs is an array
          const recentLogs = Array.isArray(adherenceDataRaw?.recentLogs)
            ? adherenceDataRaw.recentLogs
            : []

          const missedDoses = recentLogs.filter(log =>
            log.status === 'missed' || log.status === 'delayed'
          )

          allAlerts.push(...missedDoses.map(log => ({
            ...log,
            elderly: patient,
            severity: calculateSeverity(log),
            timeSinceMissed: calculateTimeSince(log.scheduledTime)
          })))
        } catch (err) {
          console.error(`Error loading alerts for ${patient.firstName}:`, err)
        }
      }

      setAlerts(allAlerts.sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime)))
    } catch (error) {
      console.error('Error loading alerts:', error)
      toast.error('Failed to load alerts')
      setElderly([])
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const now = new Date()
    const mapping = { '1h': 1, '24h': 24, '7d': 7 * 24, '30d': 30 * 24 }
    const hoursAgo = mapping[filters.timeRange] || 24
    const start = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    return start.toISOString().split('T')[0]
  }

  const calculateSeverity = (log) => {
    const hoursSince = (new Date() - new Date(log.scheduledTime)) / (1000 * 60 * 60)
    if (hoursSince > 24) return 'critical'
    if (hoursSince > 6) return 'high'
    if (hoursSince > 2) return 'medium'
    return 'low'
  }

  const calculateTimeSince = (scheduledTime) => {
    const diffMs = new Date() - new Date(scheduledTime)
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return diffHours > 0 ? `${diffHours}h ${diffMinutes}m ago` : `${diffMinutes}m ago`
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '📋'
    }
  }

  const markAsResolved = (alertId) => {
    setAlerts(alerts.filter(alert => alert._id !== alertId))
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity
    const matchesElderly = filters.elderlyId === 'all' || alert.elderly._id === filters.elderlyId
    return matchesSeverity && matchesElderly
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Missed Dose Alerts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <select
            value={filters.severity}
            onChange={e => setFilters({ ...filters, severity: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{color: "black"}}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          <select
            value={filters.elderlyId}
            onChange={e => setFilters({ ...filters, elderlyId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{color: "black"}}
          >
            <option value="all">All Patients</option>
            {elderly.map(p => (
              <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select
            value={filters.timeRange}
            onChange={e => setFilters({ ...filters, timeRange: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{color: "black"}}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No missed dose alerts found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div key={alert._id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                    <h3 className="text-lg font-semibold">{alert.elderly.firstName} {alert.elderly.lastName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Medication:</strong> {alert.medication?.name} ({alert.medication?.dosage} {alert.medication?.unit})
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Scheduled:</strong> {new Date(alert.scheduledTime).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Time Since Missed:</strong> {alert.timeSinceMissed}
                  </div>
                  {alert.notes && (
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Notes:</strong> {alert.notes}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAsResolved(alert._id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => {}}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View Patient
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MissedDoseAlerts
