import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiAward, FiPlay, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useUiStore } from '../stores/uiStore';
import ThemeToggle from './ThemeToggle';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const navItems = [
    { icon: FiHome, label: 'الرئيسية', path: '/dashboard' },
    { icon: FiPlay, label: 'الاختبار', path: '/quiz' },
    { icon: FiAward, label: 'المتصدرين', path: '/leaderboard' },
    { icon: FiUser, label: 'الملف الشخصي', path: '/profile' },
  ];

  const { openConfirm } = useUiStore();

  const handleLogout = () => {
    openConfirm({
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟',
      confirmLabel: 'خروج',
      variant: 'danger',
      onConfirm: logout,
    });
  };

  return (
    <div className="min-h-screen text-theme-main pb-20 md:pb-0">
      {/* Top Navbar for Desktop/Tablet */}
      <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b shadow-lg hidden md:block ${
        isDark 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">Q</span>
              </div>
              <span className="font-bold text-xl tracking-tight">SmartQ</span>
            </div>

            {/* Desktop Links */}
            <div className="flex items-center gap-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive 
                        ? 'bg-primary-600/20 text-primary-500 font-bold' 
                        : isDark 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* User Profile / Theme Toggle / Logout */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <span className={`text-sm hidden lg:block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                title="تسجيل الخروج"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-4 md:pt-20 px-4 max-w-7xl mx-auto min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={`fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl border-t md:hidden pb-safe ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="grid grid-cols-5 h-16 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex flex-col items-center justify-center h-full space-y-1 transition-all ${
                  isActive 
                    ? 'text-primary-500' 
                    : isDark 
                      ? 'text-gray-500 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} className={isActive ? 'animate-bounce-short' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex flex-col items-center justify-center h-full space-y-1 text-red-500/70 hover:text-red-500"
          >
            <FiLogOut size={24} />
            <span className="text-[10px] font-medium">خروج</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
