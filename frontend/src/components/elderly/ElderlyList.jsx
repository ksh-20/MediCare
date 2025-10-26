import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { elderlyService } from '../../services/elderlyService'
import { Search, Plus, Edit, Trash2, Eye, Phone, Mail, Calendar } from 'lucide-react'
import { dateHelpers } from '../../utils/dateHelpers'
import toast from 'react-hot-toast'

function ElderlyList() {
  const [elderly, setElderly] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredElderly, setFilteredElderly] = useState([])

  useEffect(() => {
    loadElderly()
  }, [])

  useEffect(() => {
    const filtered = Array.isArray(elderly)
      ? elderly.filter(patient =>
          patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
        )
      : []
    setFilteredElderly(filtered)
  }, [elderly, searchTerm])

  const loadElderly = async () => {
    try {
      setLoading(true)
      const res = await elderlyService.getAllElderly()
      
      // Check if response has a "data" property
      const patients = Array.isArray(res) ? res : res.data
      setElderly(patients)
    } catch (error) {
      toast.error('Failed to load elderly patients')
      console.error('Error loading elderly:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await elderlyService.deleteElderly(id)
        setElderly(elderly.filter(patient => patient._id !== id))
        toast.success('Patient deleted successfully')
      } catch (error) {
        toast.error('Failed to delete patient')
        console.error('Error deleting elderly:', error)
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Elderly Patients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your elderly patients
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/elderly/new"
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patients Grid */}
      {filteredElderly.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new patient.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                to="/elderly/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredElderly.map((patient) => (
            <div key={patient._id} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Age: {dateHelpers.calculateAge(patient.dateOfBirth)} years
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {patient.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/elderly/${patient._id}`}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/elderly/${patient._id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Edit patient"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(patient._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete patient"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Emergency Contact */}
                {patient.emergencyContact && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Emergency Contact
                    </p>
                    <p className="text-sm text-gray-900">
                      {patient.emergencyContact.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {patient.emergencyContact.phone}
                    </p>
                  </div>
                )}

                {/* Medical Conditions */}
                {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalConditions.slice(0, 3).map((condition, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {condition}
                        </span>
                      ))}
                      {patient.medicalConditions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{patient.medicalConditions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ElderlyList
