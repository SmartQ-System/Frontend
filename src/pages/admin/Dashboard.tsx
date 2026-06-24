import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useUiStore } from '../../stores/uiStore'
import { dashboardApi } from '../../lib/api'
import { FiHome, FiHelpCircle, FiLayers, FiSettings, FiLogOut, FiMenu, FiX, FiUser, FiBook } from 'react-icons/fi'
import ThemeToggle from '../../components/ThemeToggle'
import QuestionsPage from './Questions'
import UsersPage from './Users'
import CategoriesPage from './Categories'
import SettingsPage from './Settings'
import PlaylistsPage from './Playlists'
import PlaylistDetailsPage from './PlaylistDetail'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { toast } from 'react-hot-toast'
import DeveloperFooter from '../../components/DeveloperFooter'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { openConfirm } = useUiStore()

  const handleLogout = () => {
    openConfirm({
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟',
      confirmLabel: 'خروج',
      variant: 'danger',
      onConfirm: () => {
        logout()
        navigate('/login')
      },
    })
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-theme-main text-theme-main transition-colors duration-300">
      {/* Mobile header */}
      <header className={`lg:hidden backdrop-blur-sm px-4 py-3 flex items-center justify-between sticky top-0 z-40 shrink-0 ${
        isDark ? 'bg-gray-800/80 border-b border-gray-700/50' : 'bg-white/80 border-b border-gray-200/50'
      }`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-theme-muted hover:text-theme-main"
        >
          <FiMenu className="text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">Q</span>
          </div>
          <span className="font-bold text-theme-main">SmartQ</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-64 backdrop-blur-sm p-6 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isDark ? 'bg-gray-800/95 lg:bg-gray-800/50 border-l border-gray-700/50' : 'bg-white/95 lg:bg-white/70 border-l border-gray-200/50'}
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button on mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden absolute top-4 left-4 p-2 text-theme-muted hover:text-theme-main"
        >
          <FiX className="text-xl" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">Q</span>
          </div>
          <div>
            <h1 className="font-bold text-theme-main">SmartQ</h1>
            <p className="text-xs text-theme-muted">لوحة التحكم</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <NavLink to="/admin" icon={<FiHome />} active={location.pathname === '/admin'} onClick={closeSidebar} isDark={isDark}>
            الرئيسية
          </NavLink>
          <NavLink to="/admin/questions" icon={<FiHelpCircle />} active={location.pathname === '/admin/questions'} onClick={closeSidebar} isDark={isDark}>
            الأسئلة
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/users" icon={<FiUser />} active={location.pathname === '/admin/users'} onClick={closeSidebar} isDark={isDark}>
                المستخدمين
              </NavLink>
            </>
          )}
          <NavLink to="/admin/categories" icon={<FiLayers />} active={location.pathname === '/admin/categories'} onClick={closeSidebar} isDark={isDark}>
            التصنيفات
          </NavLink>
          <NavLink to="/admin/playlists" icon={<FiBook />} active={location.pathname.startsWith('/admin/playlists')} onClick={closeSidebar} isDark={isDark}>
            قوائم التشغيل
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin/settings" icon={<FiSettings />} active={location.pathname === '/admin/settings'} onClick={closeSidebar} isDark={isDark}>
              الإعدادات
            </NavLink>
          )}
        </nav>

        {/* Theme Toggle & User info & logout */}
        <div className={`border-t pt-4 mt-4 shrink-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="hidden lg:flex mb-3">
            <ThemeToggle />
          </div>
          <div className="text-sm text-theme-muted mb-3 truncate">{user?.name || user?.email}</div>
          <DeveloperFooter className="border-t border-theme/30 mb-3" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-theme-muted hover:text-red-500 transition-colors w-full"
          >
            <FiLogOut />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="playlists" element={<PlaylistsPage />} />
            <Route path="playlists/:id" element={<PlaylistDetailsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function NavLink({ 
  to, 
  icon, 
  children, 
  active,
  onClick,
  isDark
}: { 
  to: string
  icon: React.ReactNode
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  isDark: boolean
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-purple-500/20 text-purple-500 border border-purple-500/30' 
          : isDark 
            ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function DashboardHome() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [stats, setStats] = useState({
    questionsCount: 0,
    categoriesCount: 0,
    levelsCount: 0,
    playlistsCount: 0,
    usersCount: 0,
    leaderboard: [],
    studentActivity: [],
    mentorActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats()
        console.log('Dashboard Stats Response:', res.data)
        setStats(res.data.stats)
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('فشل في تحميل الإحصائيات')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-theme-main mb-2">مرحباً بك في لوحة التحكم</h1>
      <p className="text-theme-muted mb-6 sm:mb-8">إدارة الأسئلة والتصنيفات والإعدادات</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="إجمالي الأسئلة" 
          value={loading ? "..." : stats.questionsCount} 
          icon={<FiHelpCircle className="text-xl sm:text-2xl" />}
          color="from-purple-500 to-blue-500"
          to="/admin/questions"
        />
        <StatCard 
          title="التصنيفات" 
          value={loading ? "..." : stats.categoriesCount} 
          icon={<FiLayers className="text-xl sm:text-2xl" />}
          color="from-pink-500 to-rose-500"
          to="/admin/categories"
        />
        <StatCard 
          title="قوائم التشغيل" 
          value={loading ? "..." : stats.playlistsCount} 
          icon={<FiBook className="text-xl sm:text-2xl" />}
          color="from-purple-500 to-indigo-500"
          to="/admin/playlists"
        />
        <StatCard 
          title="الطلاب" 
          value={loading ? "..." : stats.usersCount} 
          icon={<FiUser className="text-xl sm:text-2xl" />}
          color="from-green-500 to-emerald-500"
          to="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Student Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-theme-main mb-4">نشاط الطلاب (آخر 7 أيام)</h3>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.studentActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="date" stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} tickFormatter={(value) => value.slice(5)} />
                <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#fff' : '#000' }}
                  itemStyle={{ color: isDark ? '#fff' : '#000' }}
                />
                <Bar dataKey="count" name="إجابات" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mentor Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-theme-main mb-4">نشاط المشرفين (أسئلة مضافة)</h3>
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.mentorActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="date" stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} tickFormatter={(value) => value.slice(5)} />
                <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDark ? '#374151' : '#E5E7EB', color: isDark ? '#fff' : '#000' }}
                  itemStyle={{ color: isDark ? '#fff' : '#000' }}
                />
                <Line type="monotone" dataKey="count" name="أسئلة" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-8 card">
        <h3 className="text-lg font-bold text-theme-main mb-4">أفضل الطلاب (قائمة المتصدرين)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className={`text-theme-muted border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
                <th className="pb-3 px-4">#</th>
                <th className="pb-3 px-4">الطالب</th>
                <th className="pb-3 px-4">البريد الإلكتروني</th>
                <th className="pb-3 px-4">النقاط (إجابات صحيحة)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
              {stats.leaderboard?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-theme-muted">لا توجد بيانات متاحة</td>
                </tr>
              ) : (
                stats.leaderboard?.map((user: any) => (
                  <tr key={user.rank} className={`text-theme-body transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 px-4 font-bold text-purple-500">#{user.rank}</td>
                    <td className="py-3 px-4 font-medium text-theme-main">{user.name}</td>
                    <td className="py-3 px-4 text-theme-muted">{user.email || '-'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-500">{user.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  to
}: { 
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  color: string
  to: string
}) {
  return (
    <Link to={to} className="block">
      <div className="card p-4 sm:p-6 hover:scale-[1.02] transition-transform cursor-pointer h-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
            {icon || value}
          </span>
        </div>
        <h3 className="text-theme-muted text-xs sm:text-sm">{title}</h3>
        {icon && <p className="text-2xl sm:text-3xl font-bold text-theme-main mt-1">{value}</p>}
      </div>
    </Link>
  )
}
