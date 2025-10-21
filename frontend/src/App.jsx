import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './components/dashboard/Dashboard'
import ElderlyList from './components/elderly/ElderlyList'
import ElderlyForm from './components/elderly/ElderlyForm'
import ElderlyDetails from './components/elderly/ElderlyDetails'
import MedicationSchedule from './components/medication/MedicationSchedule'
import MedicationForm from './components/medication/MedicationForm'
import MedicationList from './components/medication/MedicationList'
import AdherenceLog from './components/adherence/AdherenceLog'
import MissedDoseAlerts from './components/adherence/MissedDoseAlerts'
import AdherenceReport from './components/adherence/AdherenceReport'
import ReportGenerator from './components/reports/ReportGenerator'
import Layout from './components/layout/Layout'
import './styles/globals.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Elderly Management */}
          <Route path="elderly" element={<ElderlyList />} />
          <Route path="elderly/new" element={<ElderlyForm />} />
          <Route path="elderly/:id" element={<ElderlyDetails />} />
          <Route path="elderly/:id/edit" element={<ElderlyForm />} />
          
          {/* Medication Management */}
          <Route path="medications" element={<MedicationList />} />
          <Route path="medications/new" element={<MedicationForm />} />
          <Route path="medications/:id/edit" element={<MedicationForm />} />
          <Route path="medications/schedule" element={<MedicationSchedule />} />
          
          {/* Adherence Tracking */}
          <Route path="adherence" element={<AdherenceLog />} />
          <Route path="adherence/alerts" element={<MissedDoseAlerts />} />
          <Route path="adherence/reports" element={<AdherenceReport />} />
          
          {/* Reports */}
          <Route path="reports" element={<ReportGenerator />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
