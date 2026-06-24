import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl mb-6 shadow-lg">
          <FiAlertTriangle className="text-4xl text-white" />
        </div>
        
        <h1 className="text-6xl font-bold text-theme-main mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-theme-body mb-2">الصفحة غير موجودة</h2>
        <p className="text-theme-muted mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <FiHome />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
