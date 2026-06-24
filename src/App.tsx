import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import GlobalConfirmModal from './components/common/GlobalConfirmModal'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

// Lazy-loaded components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const StudentLayout = lazy(() => import('./components/StudentLayout'))
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const StudentQuiz = lazy(() => import('./pages/student/StudentQuiz'))
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'))
const Profile = lazy(() => import('./pages/student/Profile'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-theme-muted">جاري التحميل...</p>
      </div>
    </div>
  )
}

import { useServiceWorker } from './hooks/useServiceWorker'

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const { theme } = useThemeStore()
  useServiceWorker()

  // Ensure theme is applied on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <GlobalConfirmModal />
        <Toaster position="top-center" toastOptions={{
          style: {
            background: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#333',
          },
        }} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
          {/* Public routes */}
          <Route path="/register" element={
            isAuthenticated ? (
              <Navigate to={['admin', 'mentor'].includes(user?.role || '') ? '/admin' : '/dashboard'} replace />
            ) : (
              <RegisterPage />
            )
          } />
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to={['admin', 'mentor'].includes(user?.role || '') ? '/admin' : '/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          } />

          {/* Admin & Mentor routes */}
          <Route path="/admin/*" element={
            isAuthenticated && (user?.role === 'admin' || user?.role === 'mentor') ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Student routes */}
          <Route element={
              isAuthenticated && user?.role === 'student' ? (
                <StudentLayout />
              ) : (
                <Navigate to="/login" replace />
              )
          }>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/quiz" element={<StudentQuiz />} />
          </Route>

          {/* Landing page for unauthenticated users */}
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to={['admin', 'mentor'].includes(user?.role || '') ? '/admin' : '/dashboard'} replace />
            ) : (
              <LandingPage />
            )
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}

export default App
