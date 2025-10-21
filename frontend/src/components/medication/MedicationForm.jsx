import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { medicationService } from '../../services/medicationService'
import { elderlyService } from '../../services/elderlyService'
import { validators } from '../../utils/validators'
import { ArrowLeft, Save, Pill, Calendar, Clock, AlertCircle } from 'lucide-react'
import { MEDICATION_FREQUENCIES, MEDICATION_UNITS } from '../../utils/constants'
import toast from 'react-hot-toast'

function MedicationForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dosage: '',
    unit: 'mg',
    frequency: 'once',
    startDate: '',
    endDate: '',
    elderlyId: '',
    instructions: '',
    sideEffects: '',
    notes: ''
  })

  const [elderly, setElderly] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadElderly()
    if (isEdit) {
      loadMedicationData()
    }
  }, [id, isEdit])

  const loadElderly = async () => {
    try {
      const data = await elderlyService.getAllElderly()
      setElderly(data)
    } catch (error) {
      toast.error('Failed to load elderly patients')
      console.error('Error loading elderly:', error)
    }
  }

  const loadMedicationData = async () => {
    try {
      setLoading(true)
      const data = await medicationService.getMedicationById(id)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        dosage: data.dosage || '',
        unit: data.unit || 'mg',
        frequency: data.frequency || 'once',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        elderlyId: data.elderlyId || '',
        instructions: data.instructions || '',
        sideEffects: data.sideEffects || '',
        notes: data.notes || ''
      })
    } catch (error) {
      toast.error('Failed to load medication data')
      console.error('Error loading medication:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    const nameError = validators.medicationName(formData.name)
    if (nameError !== true) newErrors.name = nameError
    
    const dosageError = validators.dosage(formData.dosage)
    if (dosageError !== true) newErrors.dosage = dosageError
    
    const elderlyError = validators.required(formData.elderlyId)
    if (elderlyError !== true) newErrors.elderlyId = elderlyError
    
    const startDateError = validators.date(formData.startDate)
    if (startDateError !== true) newErrors.startDate = startDateError
    
    if (formData.endDate) {
      const endDateError = validators.date(formData.endDate)
      if (endDateError !== true) newErrors.endDate = endDateError
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      if (isEdit) {
        await medicationService.updateMedication(id, formData)
        toast.success('Medication updated successfully')
      } else {
        await medicationService.createMedication(formData)
        toast.success('Medication created successfully')
      }
      navigate('/medications')
    } catch (error) {
      toast.error(error.message || 'Failed to save medication')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/medications')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Medication' : 'Add New Medication'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update medication information' : 'Enter medication details'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Medication Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Pill className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-input pl-10 ${errors.name ? 'error' : ''}`}
                    placeholder="Enter medication name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="elderlyId" className="form-label">
                  Patient *
                </label>
                <select
                  id="elderlyId"
                  name="elderlyId"
                  className={`form-select ${errors.elderlyId ? 'error' : ''}`}
                  value={formData.elderlyId}
                  onChange={handleChange}
                >
                  <option value="">Select a patient</option>
                  {elderly.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                {errors.elderlyId && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.elderlyId}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-input"
                placeholder="Brief description of the medication"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="dosage" className="form-label">
                  Dosage *
                </label>
                <input
                  type="text"
                  id="dosage"
                  name="dosage"
                  className={`form-input ${errors.dosage ? 'error' : ''}`}
                  placeholder="e.g., 10, 5ml"
                  value={formData.dosage}
                  onChange={handleChange}
                />
                {errors.dosage && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dosage}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unit" className="form-label">
                  Unit
                </label>
                <select
                  id="unit"
                  name="unit"
                  className="form-select"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  {MEDICATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="frequency" className="form-label">
                  Frequency *
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  className="form-select"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  {MEDICATION_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">
                  Start Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className={`form-input pl-10 ${errors.startDate ? 'error' : ''}`}
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
                {errors.startDate && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className={`form-input pl-10 ${errors.endDate ? 'error' : ''}`}
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
                {errors.endDate && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Instructions & Notes</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label htmlFor="instructions" className="form-label">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                className="form-textarea"
                placeholder="Enter specific instructions for taking this medication"
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sideEffects" className="form-label">
                Side Effects
              </label>
              <textarea
                id="sideEffects"
                name="sideEffects"
                rows={3}
                className="form-textarea"
                placeholder="List potential side effects to watch for"
                value={formData.sideEffects}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-textarea"
                placeholder="Any additional notes about this medication"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/medications')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <div className="loading mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? 'Update Medication' : 'Create Medication'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicationForm
