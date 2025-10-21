const Medication = require('../models/Medication')
const Elderly = require('../models/Elderly')
const AdherenceLog = require('../models/AdherenceLog')

// Get all medications for a caregiver
const getAllMedications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, elderlyId } = req.query
    const caregiverId = req.user._id

    // Build query
    const query = { caregiver: caregiverId }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.status = status
    }

    if (elderlyId) {
      query.elderly = elderlyId
    }

    // Execute query with pagination
    const medications = await Medication.find(query)
      .populate('elderly', 'firstName lastName')
      .populate('caregiver', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Medication.countDocuments(query)

    res.json({
      success: true,
      data: medications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get medications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error.message
    })
  }
}

// Get single medication
const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const medication = await Medication.findOne({ _id: id, caregiver: caregiverId })
      .populate('elderly', 'firstName lastName email phone')
      .populate('caregiver', 'firstName lastName email')

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      })
    }

    res.json({
      success: true,
      data: medication
    })
  } catch (error) {
    console.error('Get medication by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medication',
      error: error.message
    })
  }
}

// Create new medication
const createMedication = async (req, res) => {
  try {
    const caregiverId = req.user._id
    const { elderlyId, ...medicationData } = req.body

    // Verify elderly belongs to caregiver
    const elderly = await Elderly.findOne({ _id: elderlyId, caregiver: caregiverId })
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    const medication = new Medication({
      ...medicationData,
      elderly: elderlyId,
      caregiver: caregiverId
    })

    await medication.save()

    await medication.populate('elderly', 'firstName lastName')
    await medication.populate('caregiver', 'firstName lastName')

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: medication
    })
  } catch (error) {
    console.error('Create medication error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create medication',
      error: error.message
    })
  }
}

// Update medication
const updateMedication = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const medication = await Medication.findOneAndUpdate(
      { _id: id, caregiver: caregiverId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('elderly', 'firstName lastName')
      .populate('caregiver', 'firstName lastName')

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      })
    }

    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: medication
    })
  } catch (error) {
    console.error('Update medication error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update medication',
      error: error.message
    })
  }
}

// Delete medication
const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const medication = await Medication.findOneAndDelete({ _id: id, caregiver: caregiverId })

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      })
    }

    // Also delete associated adherence logs
    await AdherenceLog.deleteMany({ medication: id })

    res.json({
      success: true,
      message: 'Medication deleted successfully'
    })
  } catch (error) {
    console.error('Delete medication error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication',
      error: error.message
    })
  }
}

// Log medication taken
const logMedicationTaken = async (req, res) => {
  try {
    const { medicationId, elderlyId, takenAt, notes, sideEffects, mood, energy, painLevel } = req.body
    const caregiverId = req.user._id

    // Verify medication belongs to caregiver
    const medication = await Medication.findOne({ 
      _id: medicationId, 
      elderly: elderlyId, 
      caregiver: caregiverId 
    })

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      })
    }

    const takenTime = takenAt ? new Date(takenAt) : new Date()
    const scheduledTime = medication.nextDose || new Date()
    const delayMinutes = Math.round((takenTime - scheduledTime) / (1000 * 60))

    // Create adherence log
    const adherenceLog = new AdherenceLog({
      medication: medicationId,
      elderly: elderlyId,
      caregiver: caregiverId,
      scheduledTime,
      takenTime,
      status: delayMinutes > 30 ? 'delayed' : 'taken',
      delayMinutes: Math.abs(delayMinutes),
      notes,
      sideEffects: sideEffects || [],
      mood,
      energy,
      painLevel
    })

    await adherenceLog.save()

    // Update medication statistics
    medication.lastTaken = takenTime
    medication.totalDoses += 1
    medication.takenDoses += 1
    medication.updateAdherenceRate()
    medication.nextDose = medication.calculateNextDose()
    await medication.save()

    // Update elderly last medication taken
    await Elderly.findByIdAndUpdate(elderlyId, {
      lastMedicationTaken: takenTime
    })

    await adherenceLog.populate('medication', 'name dosage')
    await adherenceLog.populate('elderly', 'firstName lastName')

    res.json({
      success: true,
      message: 'Medication logged successfully',
      data: adherenceLog
    })
  } catch (error) {
    console.error('Log medication taken error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to log medication',
      error: error.message
    })
  }
}

// Get medication adherence
const getMedicationAdherence = async (req, res) => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.query
    const caregiverId = req.user._id

    // Verify medication belongs to caregiver
    const medication = await Medication.findOne({ _id: id, caregiver: caregiverId })
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      })
    }

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Get adherence statistics
    const adherenceStats = await AdherenceLog.calculateAdherenceScore(medication.elderly, start, end)
    
    // Get adherence logs for this medication
    const logs = await AdherenceLog.find({
      medication: id,
      scheduledTime: { $gte: start, $lte: end }
    })
      .populate('elderly', 'firstName lastName')
      .sort({ scheduledTime: -1 })

    res.json({
      success: true,
      data: {
        medication: {
          id: medication._id,
          name: medication.name,
          dosage: medication.dosage,
          frequency: medication.frequency
        },
        adherence: adherenceStats,
        logs
      }
    })
  } catch (error) {
    console.error('Get medication adherence error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medication adherence',
      error: error.message
    })
  }
}

// Search medications
const searchMedications = async (req, res) => {
  try {
    const { q } = req.query
    const caregiverId = req.user._id

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      })
    }

    const medications = await Medication.find({
      caregiver: caregiverId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('elderly', 'firstName lastName')
      .limit(20)

    res.json({
      success: true,
      data: medications
    })
  } catch (error) {
    console.error('Search medications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to search medications',
      error: error.message
    })
  }
}

// Get upcoming medications
const getUpcomingMedications = async (req, res) => {
  try {
    const { hours = 24 } = req.query
    const caregiverId = req.user._id

    const now = new Date()
    const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000))

    const medications = await Medication.find({
      caregiver: caregiverId,
      status: 'active',
      nextDose: { $gte: now, $lte: futureTime }
    })
      .populate('elderly', 'firstName lastName phone')
      .sort({ nextDose: 1 })

    res.json({
      success: true,
      data: medications
    })
  } catch (error) {
    console.error('Get upcoming medications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming medications',
      error: error.message
    })
  }
}

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationAdherence,
  searchMedications,
  getUpcomingMedications
}
