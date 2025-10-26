import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { elderlyService } from '../../services/elderlyService'
import toast from 'react-hot-toast'

const AdherenceLog = () => {
  const { user } = useAuth()
  const [adherenceLogs, setAdherenceLogs] = useState([])
  const [elderly, setElderly] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    elderlyId: 'all',
    status: 'all',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Ensure elderlyData is always an array
      const elderlyDataRaw = await elderlyService.getAllElderly()
      const elderlyData = Array.isArray(elderlyDataRaw) ? elderlyDataRaw : []
      setElderly(elderlyData)

      const logs = []
      for (const patient of elderlyData) {
        try {
          const adherenceDataRaw = await elderlyService.getElderlyAdherence(patient._id, {
            startDate: filters.startDate,
            endDate: filters.endDate
          })
          // Ensure recentLogs is always an array
          const adherenceData = adherenceDataRaw?.recentLogs
          if (Array.isArray(adherenceData)) {
            logs.push(...adherenceData)
          }
        } catch (error) {
          console.error(`Error loading adherence for ${patient.firstName}:`, error)
        }
      }

      setAdherenceLogs(logs)
    } catch (error) {
      toast.error('Failed to load adherence data')
      console.error('Error loading data:', error)
      setElderly([])
      setAdherenceLogs([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800'
      case 'missed': return 'bg-red-100 text-red-800'
      case 'delayed': return 'bg-yellow-100 text-yellow-800'
      case 'skipped': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return '✓'
      case 'missed': return '✗'
      case 'delayed': return '⏰'
      case 'skipped': return '⊘'
      default: return '?'
    }
  }

  const filteredLogs = (Array.isArray(adherenceLogs) ? adherenceLogs : []).filter(log => {
    const matchesElderly = filters.elderlyId === 'all' || log?.elderly?._id === filters.elderlyId
    const matchesStatus = filters.status === 'all' || log?.status === filters.status
    return matchesElderly && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Adherence Log</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
          <select
            value={filters.elderlyId}
            onChange={(e) => setFilters({ ...filters, elderlyId: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Patients</option>
            {(Array.isArray(elderly) ? elderly : []).map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="taken">Taken</option>
            <option value="missed">Missed</option>
            <option value="delayed">Delayed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No adherence logs found for the selected criteria
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taken Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(filteredLogs) ? filteredLogs : []).map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log?.elderly?.firstName} {log?.elderly?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log?.medication?.name} <br />
                      <span className="text-gray-500">{log?.medication?.dosage} {log?.medication?.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.scheduledTime ? new Date(log.scheduledTime).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.takenTime ? new Date(log.takenTime).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        <span className="mr-1">{getStatusIcon(log.status)}</span>
                        {log.status?.charAt(0).toUpperCase() + log.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.delayMinutes ? `${log.delayMinutes} min` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdherenceLog
