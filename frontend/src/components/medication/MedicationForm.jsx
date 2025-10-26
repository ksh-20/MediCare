import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { medicationService } from '../../services/medicationService'
import { elderlyService } from '../../services/elderlyService'
import { validators } from '../../utils/validators'
import { ArrowLeft, Save, Pill, Calendar, AlertCircle } from 'lucide-react'
import { MEDICATION_FREQUENCIES, MEDICATION_UNITS } from '../../utils/constants'
import toast from 'react-hot-toast'

const MedicationForm = () => {
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

  const [elderly, setElderly] = useState([]) // ensure array
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadElderly = async () => {
      try {
        const data = await elderlyService.getAllElderly()
        setElderly(Array.isArray(data) ? data : []) // safe array
      } catch (error) {
        console.error('Error loading elderly:', error)
        toast.error('Failed to load elderly patients')
        setElderly([])
      }
    }

    const loadMedication = async () => {
      if (!isEdit) return
      setLoading(true)
      try {
        const med = await medicationService.getMedicationById(id)
        setFormData({
          name: med.name || '',
          description: med.description || '',
          dosage: med.dosage || '',
          unit: med.unit || 'mg',
          frequency: med.frequency || 'once',
          startDate: med.startDate ? med.startDate.split('T')[0] : '',
          endDate: med.endDate ? med.endDate.split('T')[0] : '',
          elderlyId: med.elderlyId || '',
          instructions: med.instructions || '',
          sideEffects: med.sideEffects || '',
          notes: med.notes || ''
        })
      } catch (error) {
        console.error('Error loading medication:', error)
        toast.error('Failed to load medication data')
      } finally {
        setLoading(false)
      }
    }

    loadElderly()
    loadMedication()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
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
    if (!validateForm()) return

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
      console.error('Error saving medication:', error)
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
        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Medication Name *</label>
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
                    <AlertCircle className="h-4 w-4 mr-1" /> {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="elderlyId" className="form-label">Patient *</label>
                <select
                  id="elderlyId"
                  name="elderlyId"
                  className={`form-select ${errors.elderlyId ? 'error' : ''}`}
                  value={formData.elderlyId}
                  onChange={handleChange}
                >
                  <option value="">Select a patient</option>
                  {Array.isArray(elderly) && elderly.map(p => (
                    <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
                {errors.elderlyId && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" /> {errors.elderlyId}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-input"
                placeholder="Brief description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Dosage *"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                className={`form-input ${errors.dosage ? 'error' : ''}`}
              />
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="form-select"
              >
                {MEDICATION_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="form-select"
              >
                {MEDICATION_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
          </div>
          <div className="card-body space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="form-label">Start Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.startDate ? 'error' : ''}`}
                />
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="form-label">End Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.endDate ? 'error' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions & Notes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Instructions & Notes</h3>
          </div>
          <div className="card-body space-y-4">
            {['instructions', 'sideEffects', 'notes'].map(field => (
              <div key={field} className="form-group">
                <label htmlFor={field} className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <textarea
                  id={field}
                  name={field}
                  rows={3}
                  className="form-textarea"
                  value={formData[field]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/medications')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
            {loading ? <div className="loading mr-2"></div> : <Save className="h-4 w-4 mr-2" />}
            {isEdit ? 'Update Medication' : 'Create Medication'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MedicationForm
