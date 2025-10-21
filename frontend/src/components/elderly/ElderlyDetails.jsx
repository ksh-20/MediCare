import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { elderlyService } from '../../services/elderlyService'
import { medicationService } from '../../services/medicationService'
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  Pill,
  Activity,
  FileText,
  User,
  Heart
} from 'lucide-react'
import { dateHelpers } from '../../utils/dateHelpers'
import toast from 'react-hot-toast'

function ElderlyDetails() {
  const { id } = useParams()
  const [elderly, setElderly] = useState(null)
  const [medications, setMedications] = useState([])
  const [adherence, setAdherence] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadElderlyData()
  }, [id])

  const loadElderlyData = async () => {
    try {
      setLoading(true)
      
      // Load elderly data
      const elderlyData = await elderlyService.getElderlyById(id)
      setElderly(elderlyData)
      
      // Load medications
      const medicationsData = await elderlyService.getElderlyMedications(id)
      setMedications(medicationsData)
      
      // Load adherence data
      const adherenceData = await elderlyService.getElderlyAdherence(id, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      })
      setAdherence(adherenceData)
      
    } catch (error) {
      toast.error('Failed to load patient data')
      console.error('Error loading elderly details:', error)
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

  if (!elderly) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Patient not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The patient you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/elderly" className="btn btn-primary">
            Back to Patients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/elderly"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {elderly.firstName} {elderly.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Patient Details & Medical Information
            </p>
          </div>
        </div>
        <Link
          to={`/elderly/${id}/edit`}
          className="btn btn-primary flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Age</p>
                  <p className="text-sm text-gray-500">
                    {dateHelpers.calculateAge(elderly.dateOfBirth)} years old
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-500">{elderly.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{elderly.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                  <p className="text-sm text-gray-500">
                    {dateHelpers.formatDate(elderly.dateOfBirth)}
                  </p>
                </div>
              </div>
              
              {elderly.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-500">{elderly.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {elderly.emergencyContact && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
              </div>
              <div className="card-body space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {elderly.emergencyContact.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {elderly.emergencyContact.relationship}
                  </p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">
                    {elderly.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          {elderly.medicalConditions && elderly.medicalConditions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Medical Conditions</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {elderly.medicalConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Allergies */}
          {elderly.allergies && elderly.allergies.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {elderly.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {elderly.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Notes</h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-700">{elderly.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-body text-center">
                <Pill className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
                <p className="text-sm text-gray-500">Active Medications</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body text-center">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {adherence?.overallAdherence || 0}%
                </p>
                <p className="text-sm text-gray-500">Adherence Rate</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-body text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {adherence?.missedDoses || 0}
                </p>
                <p className="text-sm text-gray-500">Missed Doses</p>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
              <Link
                to="/medications/new"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Add Medication
              </Link>
            </div>
            <div className="card-body">
              {medications.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No medications</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This patient doesn't have any medications yet.
                  </p>
                  <Link to="/medications/new" className="btn btn-primary">
                    Add First Medication
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {medications.map((medication) => (
                    <div
                      key={medication._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {medication.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        <p className="text-xs text-gray-400">
                          Next dose: {dateHelpers.formatDateTime(medication.nextDose)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          medication.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {medication.status}
                        </span>
                        <Link
                          to={`/medications/${medication._id}/edit`}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                {/* Mock recent activity */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Pill className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Took morning medication (Lisinopril 10mg)
                    </p>
                    <p className="text-xs text-gray-500">
                      {dateHelpers.getRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Missed evening medication (Metformin 500mg)
                    </p>
                    <p className="text-xs text-gray-500">
                      {dateHelpers.getRelativeTime(new Date(Date.now() - 6 * 60 * 60 * 1000))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Medication schedule updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {dateHelpers.getRelativeTime(new Date(Date.now() - 24 * 60 * 60 * 1000))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElderlyDetails
