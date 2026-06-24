import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import GlobalConfirmModal from './components/common/GlobalConfirmModal'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import GuestGuard from './components/guards/GuestGuard'
import RoleGuard from './components/guards/RoleGuard'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

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

function App() {
  const { theme } = useThemeStore()

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
      <OverlayScrollbarsComponent 
        className="h-full w-full"
        options={{ 
          scrollbars: { 
            theme: 'os-theme-smartq', 
            autoHide: 'scroll', 
            autoHideDelay: 1000 
          } 
        }}
        defer
      >
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
              {/* Public routes (Guest Only) */}
              <Route element={<GuestGuard />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Admin & Mentor routes */}
              <Route element={<RoleGuard allowedRoles={['admin', 'mentor']} />}>
                <Route path="/admin/*" element={<AdminDashboard />} />
              </Route>

              {/* Student routes */}
              <Route element={<RoleGuard allowedRoles={['student']} />}>
                <Route element={<StudentLayout />}>
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/quiz" element={<StudentQuiz />} />
                </Route>
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </OverlayScrollbarsComponent>
    </ErrorBoundary>
  )
}

export default App
