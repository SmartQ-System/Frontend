import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { authApi } from '../lib/api';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiUser } from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email('البريد الإلكتروني غير صالح')
    .required('البريد الإلكتروني مطلوب'),
  password: Yup.string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    .required('كلمة المرور مطلوبة'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'كلمات المرور غير متطابقة')
    .required('تأكيد كلمة المرور مطلوب'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const res = await authApi.register(values.email, values.password, 'student');
      const { user, accessToken, refreshToken } = res.data;
      
      login(user, accessToken, refreshToken);
      toast.success('تم إنشاء الحساب بنجاح! مرحبًا بك.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'فشل إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background Animated Blobs */}
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob ${isDark ? 'bg-purple-600 opacity-20' : 'bg-purple-400 opacity-30'}`}></div>
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-2000 ${isDark ? 'bg-indigo-600 opacity-20' : 'bg-indigo-400 opacity-30'}`}></div>
      <div className={`absolute -bottom-32 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 ${isDark ? 'bg-pink-600 opacity-20' : 'bg-pink-400 opacity-30'}`}></div>

      <div className="card max-w-md w-full space-y-8 p-10 relative z-10">
        <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center transform rotate-3 shadow-lg">
                <span className="text-white text-3xl font-bold">Q</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-theme-main">
            إنشاء حساب جديد
            </h2>
            <p className="mt-2 text-sm text-theme-muted">
            انضم إلينا وابدأ رحلة التعلم الممتعة
            </p>
        </div>
        
        <Formik
          initialValues={{ email: '', password: '', confirmPassword: '' }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ errors, touched }) => (
            <Form className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm space-y-4">
                    {/* Email Input */}
                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-theme-muted group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <Field
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={`input-field pr-10 ${touched.email && errors.email ? 'border-red-500' : ''}`}
                            placeholder="البريد الإلكتروني"
                            dir="rtl"
                            />
                        </div>
                        <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    {/* Password Input */}
                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FiLock className="h-5 w-5 text-theme-muted group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <Field
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            className={`input-field pr-10 ${touched.password && errors.password ? 'border-red-500' : ''}`}
                            placeholder="كلمة المرور"
                            dir="rtl"
                            />
                        </div>
                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FiLock className="h-5 w-5 text-theme-muted group-focus-within:text-purple-500 transition-colors" />
                            </div>
                            <Field
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            className={`input-field pr-10 ${touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}`}
                            placeholder="تأكيد كلمة المرور"
                            dir="rtl"
                            />
                        </div>
                        <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <span className="flex items-center gap-2">
                               إنشاء الحساب <FiUser className="text-lg" />
                             </span>
                        )}
                    </button>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-theme-muted">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="font-medium text-purple-500 hover:text-purple-400 transition-colors">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
                
                {/* Developer Credit */}
                <a
                  href="https://zack-river.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-theme-muted/70 hover:text-primary-400 mt-4 transition-colors"
                >
                  صنع بـ ❤️ بواسطة م. عبدالله وجيه
                </a>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
