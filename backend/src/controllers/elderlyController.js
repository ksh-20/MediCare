const Elderly = require('../models/Elderly')
const Medication = require('../models/Medication')
const AdherenceLog = require('../models/AdherenceLog')

// Get all elderly patients for a caregiver
const getAllElderly = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query
    const caregiverId = req.user._id

    // Build query
    const query = { caregiver: caregiverId }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.isActive = status === 'active'
    }

    // Execute query with pagination
    const elderly = await Elderly.find(query)
      .populate('caregiver', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Elderly.countDocuments(query)

    res.json({
      success: true,
      data: elderly,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Get elderly error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elderly patients',
      error: error.message
    })
  }
}

// Get single elderly patient
const getElderlyById = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const elderly = await Elderly.findOne({ _id: id, caregiver: caregiverId })
      .populate('caregiver', 'firstName lastName email')

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    res.json({
      success: true,
      data: elderly
    })
  } catch (error) {
    console.error('Get elderly by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elderly patient',
      error: error.message
    })
  }
}

// Create new elderly patient
const createElderly = async (req, res) => {
  try {
    const caregiverId = req.user._id
    const elderlyData = {
      ...req.body,
      caregiver: caregiverId
    }

    const elderly = new Elderly(elderlyData)
    await elderly.save()

    await elderly.populate('caregiver', 'firstName lastName email')

    res.status(201).json({
      success: true,
      message: 'Elderly patient created successfully',
      data: elderly
    })
  } catch (error) {
    console.error('Create elderly error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create elderly patient',
      error: error.message
    })
  }
}

// Update elderly patient
const updateElderly = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const elderly = await Elderly.findOneAndUpdate(
      { _id: id, caregiver: caregiverId },
      req.body,
      { new: true, runValidators: true }
    ).populate('caregiver', 'firstName lastName email')

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    res.json({
      success: true,
      message: 'Elderly patient updated successfully',
      data: elderly
    })
  } catch (error) {
    console.error('Update elderly error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update elderly patient',
      error: error.message
    })
  }
}

// Delete elderly patient
const deleteElderly = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    const elderly = await Elderly.findOneAndDelete({ _id: id, caregiver: caregiverId })

    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    // Also delete associated medications and logs
    await Medication.deleteMany({ elderly: id })
    await AdherenceLog.deleteMany({ elderly: id })

    res.json({
      success: true,
      message: 'Elderly patient deleted successfully'
    })
  } catch (error) {
    console.error('Delete elderly error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete elderly patient',
      error: error.message
    })
  }
}

// Get elderly medications
const getElderlyMedications = async (req, res) => {
  try {
    const { id } = req.params
    const caregiverId = req.user._id

    // Verify elderly belongs to caregiver
    const elderly = await Elderly.findOne({ _id: id, caregiver: caregiverId })
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    const medications = await Medication.find({ elderly: id })
      .populate('elderly', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: medications
    })
  } catch (error) {
    console.error('Get elderly medications error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error.message
    })
  }
}

// Get elderly adherence data
const getElderlyAdherence = async (req, res) => {
  try {
    const { id } = req.params
    const { startDate, endDate } = req.query
    const caregiverId = req.user._id

    // Verify elderly belongs to caregiver
    const elderly = await Elderly.findOne({ _id: id, caregiver: caregiverId })
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Get adherence statistics
    const adherenceStats = await AdherenceLog.calculateAdherenceScore(id, start, end)
    
    // Get adherence trends
    const trends = await AdherenceLog.getAdherenceTrends(id, 30)

    // Get recent adherence logs
    const recentLogs = await AdherenceLog.find({
      elderly: id,
      scheduledTime: { $gte: start, $lte: end }
    })
      .populate('medication', 'name dosage')
      .sort({ scheduledTime: -1 })
      .limit(50)

    res.json({
      success: true,
      data: {
        elderly: {
          id: elderly._id,
          name: elderly.fullName,
          age: elderly.age
        },
        adherence: adherenceStats,
        trends,
        recentLogs
      }
    })
  } catch (error) {
    console.error('Get elderly adherence error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adherence data',
      error: error.message
    })
  }
}

// Get elderly reports
const getElderlyReports = async (req, res) => {
  try {
    const { id } = req.params
    const { startDate, endDate, type = 'comprehensive' } = req.query
    const caregiverId = req.user._id

    // Verify elderly belongs to caregiver
    const elderly = await Elderly.findOne({ _id: id, caregiver: caregiverId })
    if (!elderly) {
      return res.status(404).json({
        success: false,
        message: 'Elderly patient not found'
      })
    }

    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    // Get medications
    const medications = await Medication.find({ elderly: id })
      .populate('elderly', 'firstName lastName')

    // Get adherence data
    const adherenceStats = await AdherenceLog.calculateAdherenceScore(id, start, end)
    const trends = await AdherenceLog.getAdherenceTrends(id, 30)

    // Get adherence logs
    const adherenceLogs = await AdherenceLog.find({
      elderly: id,
      scheduledTime: { $gte: start, $lte: end }
    })
      .populate('medication', 'name dosage')
      .sort({ scheduledTime: -1 })

    const report = {
      elderly: {
        id: elderly._id,
        name: elderly.fullName,
        age: elderly.age,
        email: elderly.email,
        phone: elderly.phone
      },
      period: {
        startDate: start,
        endDate: end
      },
      medications: medications.length,
      adherence: adherenceStats,
      trends,
      logs: adherenceLogs,
      generatedAt: new Date()
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Get elderly reports error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    })
  }
}

// Get elderly statistics
const getElderlyStats = async (req, res) => {
  try {
    const caregiverId = req.user._id

    const totalElderly = await Elderly.countDocuments({ caregiver: caregiverId })
    const activeElderly = await Elderly.countDocuments({ caregiver: caregiverId, isActive: true })
    
    const totalMedications = await Medication.countDocuments({ caregiver: caregiverId })
    const activeMedications = await Medication.countDocuments({ 
      caregiver: caregiverId, 
      status: 'active' 
    })

    // Get adherence statistics for all elderly
    const adherenceStats = await AdherenceLog.aggregate([
      {
        $lookup: {
          from: 'elderlies',
          localField: 'elderly',
          foreignField: '_id',
          as: 'elderly'
        }
      },
      {
        $match: {
          'elderly.caregiver': caregiverId
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          taken: {
            $sum: { $cond: [{ $eq: ['$status', 'taken'] }, 1, 0] }
          }
        }
      }
    ])

    const overallAdherence = adherenceStats.length > 0 
      ? Math.round((adherenceStats[0].taken / adherenceStats[0].total) * 100)
      : 0

    res.json({
      success: true,
      data: {
        elderly: {
          total: totalElderly,
          active: activeElderly
        },
        medications: {
          total: totalMedications,
          active: activeMedications
        },
        adherence: {
          overall: overallAdherence
        }
      }
    })
  } catch (error) {
    console.error('Get elderly stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    })
  }
}

module.exports = {
  getAllElderly,
  getElderlyById,
  createElderly,
  updateElderly,
  deleteElderly,
  getElderlyMedications,
  getElderlyAdherence,
  getElderlyReports,
  getElderlyStats
}
