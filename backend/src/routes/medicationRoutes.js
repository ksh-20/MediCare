const express = require('express')
const {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  logMedicationTaken,
  getMedicationAdherence,
  searchMedications,
  getUpcomingMedications
} = require('../controllers/medicationController')
const { validateMedication, validateAdherenceLog, validateObjectId, validatePagination, validateDateRange } = require('../middleware/validator')

const router = express.Router()

// Get all medications
router.get('/', validatePagination, getAllMedications)

// Search medications
router.get('/search', searchMedications)

// Get upcoming medications
router.get('/upcoming', getUpcomingMedications)

// Get single medication
router.get('/:id', validateObjectId('id'), getMedicationById)

// Create new medication
router.post('/', validateMedication, createMedication)

// Update medication
router.put('/:id', validateObjectId('id'), validateMedication, updateMedication)

// Delete medication
router.delete('/:id', validateObjectId('id'), deleteMedication)

// Log medication taken
router.post('/log-taken', validateAdherenceLog, logMedicationTaken)

// Get medication adherence
router.get('/:id/adherence', validateObjectId('id'), validateDateRange, getMedicationAdherence)

module.exports = router
