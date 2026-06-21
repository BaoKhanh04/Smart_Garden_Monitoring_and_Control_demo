import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OverviewPage from '@/pages/OverviewPage'
import ControlPage from '@/pages/ControlPage'
import IrrigationPage from '@/pages/IrrigationPage'
import DiseaseDetectionPage from '@/pages/DiseaseDetectionPage'
import DiseaseRiskPage from '@/pages/DiseaseRiskPage'
import RecommendationsPage from '@/pages/RecommendationsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import WaterUsagePage from '@/pages/WaterUsagePage'
import PowerMonitoringPage from '@/pages/PowerMonitoringPage'
import HarvestPredictionPage from '@/pages/HarvestPredictionPage'
import GrowthTrackingPage from '@/pages/GrowthTrackingPage'
import PhotoGalleryPage from '@/pages/PhotoGalleryPage'
import CameraPage from '@/pages/CameraPage'
import WeatherPage from '@/pages/WeatherPage'
import FarmingLogPage from '@/pages/FarmingLogPage'
import NotificationsPage from '@/pages/NotificationsPage'
import ProfilePage from '@/pages/ProfilePage'
import MembersPage from '@/pages/MembersPage'
import ThresholdsPage from '@/pages/ThresholdsPage'
import RulesPage from '@/pages/RulesPage'
import DeviceHealthPage from '@/pages/DeviceHealthPage'
import GardensPage from '@/pages/GardensPage'

function ProtectedRoute({ children, ownerOnly = false }: { children: React.ReactNode; ownerOnly?: boolean }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (ownerOnly && user.role !== 'OWNER') return <Navigate to="/dashboard/overview" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard/overview" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard/overview" replace /> : <RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="dashboard/overview" element={<OverviewPage />} />
        <Route path="dashboard/control" element={<ControlPage />} />
        <Route path="dashboard/irrigation" element={<IrrigationPage />} />
        <Route path="dashboard/disease-detection" element={<ProtectedRoute ownerOnly><DiseaseDetectionPage /></ProtectedRoute>} />
        <Route path="dashboard/disease-risk" element={<ProtectedRoute ownerOnly><DiseaseRiskPage /></ProtectedRoute>} />
        <Route path="dashboard/recommendations" element={<ProtectedRoute ownerOnly><RecommendationsPage /></ProtectedRoute>} />
        <Route path="dashboard/analytics" element={<ProtectedRoute ownerOnly><AnalyticsPage /></ProtectedRoute>} />
        <Route path="dashboard/water-usage" element={<ProtectedRoute ownerOnly><WaterUsagePage /></ProtectedRoute>} />
        <Route path="dashboard/power-monitoring" element={<ProtectedRoute ownerOnly><PowerMonitoringPage /></ProtectedRoute>} />
        <Route path="dashboard/harvest-prediction" element={<ProtectedRoute ownerOnly><HarvestPredictionPage /></ProtectedRoute>} />
        <Route path="dashboard/growth-tracking" element={<GrowthTrackingPage />} />
        <Route path="dashboard/photo-gallery" element={<PhotoGalleryPage />} />
        <Route path="dashboard/camera" element={<CameraPage />} />
        <Route path="dashboard/weather" element={<WeatherPage />} />
        <Route path="dashboard/farming-log" element={<FarmingLogPage />} />
        <Route path="dashboard/notifications" element={<NotificationsPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/members" element={<ProtectedRoute ownerOnly><MembersPage /></ProtectedRoute>} />
        <Route path="settings/thresholds" element={<ProtectedRoute ownerOnly><ThresholdsPage /></ProtectedRoute>} />
        <Route path="settings/rules" element={<ProtectedRoute ownerOnly><RulesPage /></ProtectedRoute>} />
        <Route path="settings/device-health" element={<ProtectedRoute ownerOnly><DeviceHealthPage /></ProtectedRoute>} />
        <Route path="settings/gardens" element={<ProtectedRoute ownerOnly><GardensPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
