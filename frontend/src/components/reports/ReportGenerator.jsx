import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { reportService } from '../../services/reportService'
import { elderlyService } from '../../services/elderlyService'

const ReportGenerator = () => {
  const { user } = useAuth()
  const [elderly, setElderly] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedElderly, setSelectedElderly] = useState('all')
  const [reportType, setReportType] = useState('adherence')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Load elderly list on mount
  useEffect(() => {
    const loadElderly = async () => {
      try {
        const elderlyData = await elderlyService.getAllElderly()
        setElderly(Array.isArray(elderlyData) ? elderlyData : [])
      } catch (error) {
        console.error('Error loading elderly:', error)
        setElderly([])
      }
    }

    loadElderly()
  }, [])

  const generateReport = async () => {
    if (!Array.isArray(elderly) || elderly.length === 0) return

    setLoading(true)
    try {
      let reportsToSet = []

      // If all patients selected
      if (selectedElderly === 'all') {
        const allReports = await Promise.all(
          elderly.map(async (patient) => {
            if (!patient._id) return null // Skip invalid patient
            try {
              return await reportService.generateAdherenceReport(patient._id, {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                type: reportType
              })
            } catch (error) {
              console.error(`Error generating report for ${patient.firstName}:`, error)
              return null
            }
          })
        )
        reportsToSet = allReports.filter(Boolean) // remove nulls
      } else {
        // Single patient report
        try {
          const report = await reportService.generateAdherenceReport(selectedElderly, {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            type: reportType
          })
          reportsToSet = [report]
        } catch (error) {
          console.error('Error generating report:', error)
          reportsToSet = []
        }
      }

      setReports(reportsToSet)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (elderlyId, reportType) => {
    try {
      await reportService.downloadReport(elderlyId, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        type: reportType,
        format: 'pdf'
      })
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  const getReportSummary = (report) => {
    if (!report) return {}
    return {
      totalMedications: report.medications || 0,
      adherenceRate: report.adherence?.overallRate || 0,
      takenDoses: report.adherence?.takenDoses || 0,
      missedDoses: report.adherence?.missedDoses || 0,
      delayedDoses: report.adherence?.delayedDoses || 0
    }
  }

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAdherenceStatus = (rate) => {
    if (rate >= 90) return 'Excellent'
    if (rate >= 70) return 'Good'
    if (rate >= 50) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Generator</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
              <select
                value={selectedElderly}
                onChange={(e) => setSelectedElderly(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Patients</option>
                {Array.isArray(elderly) && elderly.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="adherence">Adherence Report</option>
                <option value="medication">Medication Report</option>
                <option value="comprehensive">Comprehensive Report</option>
                <option value="summary">Summary Report</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Generate button */}
          <div className="mt-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No reports generated yet</div>
          <div className="text-gray-400 text-sm mt-2">Select criteria and click "Generate Report" to create reports</div>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => {
            const summary = getReportSummary(report)
            if (!summary) return null

            return (
              <div key={report.elderly?.id || 'unknown'} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {report.elderly?.name || 'Unknown Patient'}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadReport(report.elderly?.id, reportType)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => {/* Print functionality */}}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Print
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{summary.totalMedications}</div>
                    <div className="text-sm text-blue-600">Total Medications</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className={`text-2xl font-bold ${getAdherenceColor(summary.adherenceRate)}`}>{summary.adherenceRate}%</div>
                    <div className="text-sm text-gray-600">Adherence Rate</div>
                    <div className="text-xs text-gray-500">{getAdherenceStatus(summary.adherenceRate)}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{summary.takenDoses}</div>
                    <div className="text-sm text-green-600">Doses Taken</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{summary.missedDoses}</div>
                    <div className="text-sm text-red-600">Doses Missed</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{summary.delayedDoses}</div>
                    <div className="text-sm text-yellow-600">Doses Delayed</div>
                  </div>
                </div>

                {/* Report info */}
                <div className="text-sm text-gray-600">
                  <div><strong>Report Period:</strong> {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}</div>
                  <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
                  <div><strong>Report Type:</strong> {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReportGenerator