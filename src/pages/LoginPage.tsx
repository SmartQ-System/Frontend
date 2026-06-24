import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { authApi } from '../lib/api'
import { FiMail, FiLock, FiLogIn, FiUser, FiUsers } from 'react-icons/fi'
import ThemeToggle from '../components/ThemeToggle'

// Validation schema with Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('البريد الإلكتروني غير صالح')
    .required('البريد الإلكتروني مطلوب'),
  password: Yup.string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .required('كلمة المرور مطلوبة'),
})

interface LoginValues {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const initialValues: LoginValues = {
    email: '',
    password: '',
  }

  const handleSubmit = async (values: LoginValues) => {
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login(values.email, values.password)
      const { user, accessToken, refreshToken } = response.data
      login(user, accessToken, refreshToken)
      navigate(user.role === 'admin' ? '/admin' : '/quiz')
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (role: 'admin' | 'student') => {
    setError('')
    setLoading(true)

    try {
      const response = await authApi.quickLogin(role)
      const { user, accessToken, refreshToken } = response.data
      login(user, accessToken, refreshToken)
      navigate(role === 'admin' ? '/admin' : '/quiz')
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل الدخول السريع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
          isDark ? 'bg-primary-500/20' : 'bg-primary-400/30'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
          isDark ? 'bg-accent-500/20' : 'bg-accent-400/30'
        }`} />
      </div>

      <div className="card p-8 w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
            <span className="text-3xl font-bold text-white">Q</span>
          </div>
          <h1 className="text-3xl font-bold text-theme-main mb-2">SmartQ</h1>
          <p className="text-theme-muted">الاختبارات الذكية التفاعلية</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Formik Login Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4 mb-6">
              <div>
                <div className="relative">
                  <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted" />
                  <Field
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    className={`input-field pr-12 ${
                      errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                <ErrorMessage 
                  name="email" 
                  component="p" 
                  className="text-red-400 text-sm mt-1 mr-1" 
                />
              </div>

              <div>
                <div className="relative">
                  <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted" />
                  <Field
                    type="password"
                    name="password"
                    placeholder="كلمة المرور"
                    className={`input-field pr-12 ${
                      errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                <ErrorMessage 
                  name="password" 
                  component="p" 
                  className="text-red-400 text-sm mt-1 mr-1" 
                />
              </div>

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FiLogIn />
                {loading || isSubmitting ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
              </button>
            </Form>
          )}
        </Formik>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 text-theme-muted ${isDark ? 'bg-gray-800' : 'bg-white'}`}>أو دخول سريع</span>
          </div>
        </div>

        {/* Quick login buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleQuickLogin('admin')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FiUser />
            <span>كمدير</span>
          </button>
          <button
            onClick={() => handleQuickLogin('student')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <FiUsers />
            <span>كطالب</span>
          </button>
        </div>
 
        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-theme-muted text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-theme-muted text-sm mt-6">
          نظام اختبارات تفاعلي مع تحويل النص إلى كلام
        </p>
        
        {/* Developer Credit */}
        <a
          href="https://zack-river.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-theme-muted/70 hover:text-primary-400 mt-3 transition-colors"
        >
          صنع بـ ❤️ بواسطة م. عبدالله وجيه
        </a>
      </div>
    </div>
  )
}
