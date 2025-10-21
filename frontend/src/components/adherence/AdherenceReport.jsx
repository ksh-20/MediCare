import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { elderlyService } from '../../services/elderlyService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const AdherenceReport = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedElderly, setSelectedElderly] = useState('all')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadReports()
  }, [selectedElderly, dateRange])

  const loadReports = async () => {
    try {
      setLoading(true)
      const elderlyData = await elderlyService.getAllElderly()
      
      const reportData = []
      for (const patient of elderlyData) {
        try {
          const adherenceData = await elderlyService.getElderlyAdherence(patient._id, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          })
          
          reportData.push({
            patient: patient,
            adherence: adherenceData.adherence,
            trends: adherenceData.trends,
            recentLogs: adherenceData.recentLogs
          })
        } catch (error) {
          console.error(`Error loading report for ${patient.firstName}:`, error)
        }
      }
      
      setReports(reportData)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAdherenceTrendData = (trends) => {
    return trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      adherence: trend.adherenceRate
    }))
  }

  const getStatusDistribution = (recentLogs) => {
    const statusCounts = recentLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }))
  }

  const getWeeklyAdherence = (recentLogs) => {
    const weeklyData = {}
    
    recentLogs.forEach(log => {
      const date = new Date(log.scheduledTime)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { taken: 0, total: 0 }
      }
      
      weeklyData[weekKey].total++
      if (log.status === 'taken') {
        weeklyData[weekKey].taken++
      }
    })
    
    return Object.entries(weeklyData).map(([week, data]) => ({
      week: new Date(week).toLocaleDateString(),
      adherence: Math.round((data.taken / data.total) * 100)
    }))
  }

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const filteredReports = selectedElderly === 'all' 
    ? reports 
    : reports.filter(report => report.patient._id === selectedElderly)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Adherence Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <select
              value={selectedElderly}
              onChange={(e) => setSelectedElderly(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Patients</option>
              {reports.map(report => (
                <option key={report.patient._id} value={report.patient._id}>
                  {report.patient.firstName} {report.patient.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No adherence data found for the selected criteria</div>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredReports.map((report) => (
            <div key={report.patient._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {report.patient.firstName} {report.patient.lastName}
              </h2>
              
              {/* Adherence Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.adherence?.overallRate || 0}%
                  </div>
                  <div className="text-sm text-blue-600">Overall Adherence</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {report.adherence?.takenDoses || 0}
                  </div>
                  <div className="text-sm text-green-600">Doses Taken</div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {report.adherence?.missedDoses || 0}
                  </div>
                  <div className="text-sm text-red-600">Doses Missed</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.adherence?.delayedDoses || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Doses Delayed</div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Adherence Trend */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adherence Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getAdherenceTrendData(report.trends)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="adherence" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Status Distribution */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getStatusDistribution(report.recentLogs)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusDistribution(report.recentLogs).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Weekly Adherence */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Adherence</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeeklyAdherence(report.recentLogs)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="adherence" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdherenceReport
