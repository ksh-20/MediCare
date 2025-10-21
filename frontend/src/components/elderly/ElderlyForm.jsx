import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { elderlyService } from '../../services/elderlyService'
import { validators } from '../../utils/validators'
import { ArrowLeft, Save, User, Phone, Mail, Calendar, AlertCircle, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

function ElderlyForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalConditions: [],
    allergies: [],
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [newCondition, setNewCondition] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadElderlyData()
    }
  }, [id, isEdit])

  const loadElderlyData = async () => {
    try {
      setLoading(true)
      const data = await elderlyService.getElderlyById(id)
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        medicalConditions: data.medicalConditions || [],
        allergies: data.allergies || [],
        notes: data.notes || ''
      })
    } catch (error) {
      toast.error('Failed to load patient data')
      console.error('Error loading elderly:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addCondition = () => {
    if (newCondition.trim() && !formData.medicalConditions.includes(newCondition.trim())) {
      setFormData(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()]
      }))
      setNewCondition('')
    }
  }

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }))
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    const firstNameError = validators.name(formData.firstName)
    if (firstNameError !== true) newErrors.firstName = firstNameError
    
    const lastNameError = validators.name(formData.lastName)
    if (lastNameError !== true) newErrors.lastName = lastNameError
    
    const emailError = validators.email(formData.email)
    if (emailError !== true) newErrors.email = emailError
    
    const phoneError = validators.phone(formData.phone)
    if (phoneError !== true) newErrors.phone = phoneError
    
    const dateError = validators.date(formData.dateOfBirth)
    if (dateError !== true) newErrors.dateOfBirth = dateError
    
    const emergencyNameError = validators.required(formData.emergencyContact.name)
    if (emergencyNameError !== true) newErrors['emergencyContact.name'] = emergencyNameError
    
    const emergencyPhoneError = validators.phone(formData.emergencyContact.phone)
    if (emergencyPhoneError !== true) newErrors['emergencyContact.phone'] = emergencyPhoneError
    
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
        await elderlyService.updateElderly(id, formData)
        toast.success('Patient updated successfully')
      } else {
        await elderlyService.createElderly(formData)
        toast.success('Patient created successfully')
      }
      navigate('/elderly')
    } catch (error) {
      toast.error(error.message || 'Failed to save patient')
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
          onClick={() => navigate('/elderly')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update patient information' : 'Enter patient details'}
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
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`form-input pl-10 ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.firstName}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input pl-10 ${errors.phone ? 'error' : ''}`}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className={`form-input pl-10 ${errors.dateOfBirth ? 'error' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                {errors.dateOfBirth && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dateOfBirth}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-input"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="emergencyContact.name" className="form-label">
                  Name *
                </label>
                <input
                  type="text"
                  id="emergencyContact.name"
                  name="emergencyContact.name"
                  className={`form-input ${errors['emergencyContact.name'] ? 'error' : ''}`}
                  placeholder="Emergency contact name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                />
                {errors['emergencyContact.name'] && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['emergencyContact.name']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.phone" className="form-label">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="emergencyContact.phone"
                  name="emergencyContact.phone"
                  className={`form-input ${errors['emergencyContact.phone'] ? 'error' : ''}`}
                  placeholder="Emergency contact phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                />
                {errors['emergencyContact.phone'] && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors['emergencyContact.phone']}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="emergencyContact.relationship" className="form-label">
                  Relationship
                </label>
                <select
                  id="emergencyContact.relationship"
                  name="emergencyContact.relationship"
                  className="form-select"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
          </div>
          <div className="card-body space-y-6">
            {/* Medical Conditions */}
            <div>
              <label className="form-label">Medical Conditions</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Add medical condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                />
                <button
                  type="button"
                  onClick={addCondition}
                  className="btn btn-secondary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalConditions.map((condition, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="form-label">Allergies</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Add allergy"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="btn btn-secondary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="form-textarea"
                placeholder="Enter any additional notes about the patient"
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
            onClick={() => navigate('/elderly')}
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
            {isEdit ? 'Update Patient' : 'Create Patient'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ElderlyForm
