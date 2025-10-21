import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { medicationService } from '../../services/medicationService'
import { Search, Plus, Edit, Trash2, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { dateHelpers } from '../../utils/dateHelpers'
import toast from 'react-hot-toast'

function MedicationList() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredMedications, setFilteredMedications] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadMedications()
  }, [])

  useEffect(() => {
    // Filter medications based on search term and status
    let filtered = medications.filter(medication =>
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.elderlyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.dosage.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (statusFilter !== 'all') {
      filtered = filtered.filter(medication => medication.status === statusFilter)
    }

    setFilteredMedications(filtered)
  }, [medications, searchTerm, statusFilter])

  const loadMedications = async () => {
    try {
      setLoading(true)
      const data = await medicationService.getAllMedications()
      setMedications(data)
    } catch (error) {
      toast.error('Failed to load medications')
      console.error('Error loading medications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await medicationService.deleteMedication(id)
        setMedications(medications.filter(medication => medication._id !== id))
        toast.success('Medication deleted successfully')
      } catch (error) {
        toast.error('Failed to delete medication')
        console.error('Error deleting medication:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      missed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage medication schedules and track adherence
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/medications/new"
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search medications..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Medications Table */}
      {filteredMedications.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Clock className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No medications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding a new medication.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/medications/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Dose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedications.map((medication) => (
                  <tr key={medication._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {medication.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {medication.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {medication.elderlyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.dosage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {medication.nextDose 
                        ? dateHelpers.formatDateTime(medication.nextDose)
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(medication.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/medications/${medication._id}`}
                          className="text-blue-600 hover:text-blue-500"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/medications/${medication._id}/edit`}
                          className="text-green-600 hover:text-green-500"
                          title="Edit medication"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(medication._id)}
                          className="text-red-600 hover:text-red-500"
                          title="Delete medication"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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

export default MedicationList
