import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { medicationService } from '../../services/medicationService'
import { elderlyService } from '../../services/elderlyService'

const MedicationSchedule = () => {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [elderly, setElderly] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedElderly, setSelectedElderly] = useState('all')

  useEffect(() => {
    loadData()
  }, [selectedDate, selectedElderly])

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch elderly safely
      let elderlyData = []
      try {
        elderlyData = await elderlyService.getAllElderly()
      } catch (err) {
        console.error('Failed to load elderly:', err)
      }
      setElderly(Array.isArray(elderlyData) ? elderlyData : [])

      // Fetch medications safely
      let medicationsData = []
      if (typeof medicationService.getUpcomingMedications === 'function') {
        try {
          const data = await medicationService.getUpcomingMedications()
          medicationsData = Array.isArray(data) ? data : []
        } catch (err) {
          console.error('Failed to load medications:', err)
        }
      } else {
        console.warn('medicationService.getUpcomingMedications is not defined')
      }

      setMedications(medicationsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setMedications([])
      setElderly([])
    } finally {
      setLoading(false)
    }
  }

  const markAsTaken = async (medicationId, elderlyId) => {
    try {
      if (typeof medicationService.logMedicationTaken === 'function') {
        await medicationService.logMedicationTaken({
          medicationId,
          elderlyId,
          takenAt: new Date().toISOString()
        })
        loadData() // reload data
      } else {
        console.warn('logMedicationTaken function is not defined in medicationService')
      }
    } catch (err) {
      console.error('Error marking as taken:', err)
    }
  }

  const getMedicationsForDate = () => {
    const selectedDateObj = new Date(selectedDate)
    const startOfDay = new Date(selectedDateObj.setHours(0, 0, 0, 0))
    const endOfDay = new Date(selectedDateObj.setHours(23, 59, 59, 999))

    return medications.filter(med => {
      const medDate = new Date(med.nextDose)
      const isOnDate = medDate >= startOfDay && medDate <= endOfDay
      const matchesElderly = selectedElderly === 'all' || med.elderly?._id === selectedElderly
      return isOnDate && matchesElderly
    })
  }

  const groupMedicationsByTime = (medications) => {
    const groups = {}
    medications.forEach(med => {
      const time = new Date(med.nextDose).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      if (!groups[time]) groups[time] = []
      groups[time].push(med)
    })
    return Object.keys(groups).sort().map(time => ({ time, medications: groups[time] }))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

  const filteredMedications = getMedicationsForDate()
  const groupedMedications = groupMedicationsByTime(filteredMedications)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Medication Schedule</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Patient</label>
          <select value={selectedElderly} onChange={e => setSelectedElderly(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Patients</option>
            {elderly.map(patient => (
              <option key={patient._id} value={patient._id}>{patient.firstName} {patient.lastName}</option>
            ))}
          </select>
        </div>
      </div>

      {groupedMedications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">No medications scheduled for this date</div>
      ) : (
        <div className="space-y-6">
          {groupedMedications.map(({ time, medications }) => (
            <div key={time} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{time}</h3>
              <div className="space-y-3">
                {medications.map(med => (
                  <div key={med._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Patient: {med.elderly?.firstName} {med.elderly?.lastName}</p>
                      <p className="text-sm text-gray-900 font-medium">{med.name} ({med.dosage} {med.unit})</p>
                    </div>
                    <button onClick={() => markAsTaken(med._id, med.elderly?._id)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">Mark as Taken</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MedicationSchedule
