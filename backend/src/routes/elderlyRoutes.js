const express = require('express')
const {
  getAllElderly,
  getElderlyById,
  createElderly,
  updateElderly,
  deleteElderly,
  getElderlyMedications,
  getElderlyAdherence,
  getElderlyReports,
  getElderlyStats
} = require('../controllers/elderlyController')
const { validateElderly, validateObjectId, validatePagination, validateDateRange } = require('../middleware/validator')

const router = express.Router()

// Get all elderly patients
router.get('/', validatePagination, getAllElderly)

// Get elderly statistics
router.get('/stats', getElderlyStats)

// Get single elderly patient
router.get('/:id', validateObjectId('id'), getElderlyById)

// Create new elderly patient
router.post('/', validateElderly, createElderly)

// Update elderly patient
router.put('/:id', validateObjectId('id'), validateElderly, updateElderly)

// Delete elderly patient
router.delete('/:id', validateObjectId('id'), deleteElderly)

// Get elderly medications
router.get('/:id/medications', validateObjectId('id'), getElderlyMedications)

// Get elderly adherence data
router.get('/:id/adherence', validateObjectId('id'), validateDateRange, getElderlyAdherence)

// Get elderly reports
router.get('/:id/reports', validateObjectId('id'), validateDateRange, getElderlyReports)

module.exports = router
