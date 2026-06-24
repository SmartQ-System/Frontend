import { useState, useEffect } from 'react'
import { settingsApi, authApi } from '../../lib/api'
import { useThemeStore } from '../../stores/themeStore'
import { FiSave, FiUser, FiLock, FiLayout } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'

interface Settings {
  backgroundColor: string
}

interface ProfileState {
  name: string
  avatar: string
}

interface PasswordState {
  current: string
  new: string
  confirm: string
}

export default function SettingsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<'profile' | 'theme'>('profile')
  const [settings, setSettings] = useState<Settings>({ backgroundColor: '#1f2937' })
  const [profile, setProfile] = useState<ProfileState>({ name: '', avatar: '' })
  const [passwords, setPasswords] = useState<PasswordState>({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(true)
  const [options, setOptions] = useState<any>({ colors: [] })
  
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsRes, optionsRes, meRes] = await Promise.all([
        settingsApi.get(),
        settingsApi.getOptions(),
        authApi.getMe()
      ])
      
      if (settingsRes.data.settings) {
        setSettings({ backgroundColor: settingsRes.data.settings.backgroundColor || '#1f2937' })
      }
      setOptions(optionsRes.data)
      
      if (meRes.data.user) {
        setProfile({
            name: meRes.data.user.name || '',
            avatar: meRes.data.user.avatar || '',
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
        await authApi.updateProfile(profile)
        if (user) {
            setUser({ ...user, name: profile.name, avatar: profile.avatar })
        }
        toast.success('تم تحديث الملف الشخصي')
    } catch (error) {
        toast.error('فشل تحديث الملف الشخصي')
    }
  }

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
        toast.error('كلمة المرور الجديدة غير متطابقة')
        return
    }
    if (passwords.new.length < 6) {
        toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
        return
    }

    try {
        await authApi.updatePassword({
            currentPassword: passwords.current,
            newPassword: passwords.new
        })
        toast.success('تم تغيير كلمة المرور بنجاح')
        setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور')
    }
  }

  const handleSaveTheme = async () => {
    try {
      await settingsApi.update(settings)
      toast.success('تم حفظ المظهر بنجاح')
    } catch (error) {
      toast.error('فشل حفظ المظهر')
    }
  }

  if (loading) return <div className="text-center py-12 text-theme-muted">جاري التحميل...</div>

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-theme-main">الإعدادات</h1>
        <span className={`text-sm px-3 py-1 rounded-full border ${isDark ? 'text-gray-400 bg-gray-800 border-gray-700' : 'text-gray-600 bg-gray-100 border-gray-200'}`}>
            {activeTab === 'profile' ? 'الملف الشخصي' : 'المظهر'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
            <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-purple-600 text-white' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <FiUser /> الملف الشخصي
            </button>
            <button
                onClick={() => setActiveTab('theme')}
                className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${
                    activeTab === 'theme' 
                      ? 'bg-purple-600 text-white' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                <FiLayout /> المظهر
            </button>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
            {activeTab === 'profile' && (
                <>
                    <div className="card">
                        <h2 className="text-xl font-bold text-theme-main mb-6 flex items-center gap-2">
                            <FiUser className="text-purple-500" /> المعلومات الشخصية
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-theme-muted mb-1">الاسم</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="input-field w-full"
                                    placeholder="أدخل اسمك"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-muted mb-1">رابط الصورة الرمزية (Avatar URL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profile.avatar}
                                        onChange={e => setProfile({...profile, avatar: e.target.value})}
                                        className="input-field flex-1"
                                        placeholder="https://example.com/avatar.png"
                                    />
                                    {profile.avatar && (
                                        <div className={`w-10 h-10 rounded-full overflow-hidden border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>
                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleUpdateProfile} className="btn-primary w-full sm:w-auto">
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold text-theme-main mb-6 flex items-center gap-2">
                            <FiLock className="text-yellow-500" /> تغيير كلمة المرور
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-theme-muted mb-1">كلمة المرور الحالية</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-muted mb-1">كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-muted mb-1">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    className="input-field w-full"
                                />
                            </div>
                            <button onClick={handleUpdatePassword} className="btn-secondary w-full sm:w-auto">
                                تغيير كلمة المرور
                            </button>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'theme' && (
                <div className="card">
                    <h2 className="text-xl font-bold text-theme-main mb-6 flex items-center gap-2">
                        <FiLayout className="text-green-500" /> مظهر لوحة التحكم
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-theme-muted text-sm mb-3">لون الخلفية (السمة)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {options.colors?.filter((c: any) => c.id.startsWith('dark') || c.id === 'pure-black' || c.id === 'midnight').map((color: any) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSettings({ ...settings, backgroundColor: color.value })}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                                    settings.backgroundColor === color.value 
                                        ? isDark ? 'border-white bg-white/10' : 'border-purple-500 bg-purple-500/10'
                                        : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full shadow-lg" style={{ backgroundColor: color.value }} />
                                    <span className="text-theme-body font-medium text-xs text-center">{color.name.split(' - ')[0]}</span>
                                </button>
                                ))}
                            </div>
                            
                            {/* Custom Color Picker fallback */}
                            <div className={`mt-6 pt-4 border-t flex items-center gap-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <label className="text-theme-muted text-sm">لون مخصص:</label>
                                <input
                                    type="color"
                                    value={settings.backgroundColor}
                                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                                    className="w-16 h-10 rounded cursor-pointer bg-transparent"
                                />
                            </div>
                        </div>

                        <button onClick={handleSaveTheme} className="btn-primary w-full flex items-center justify-center gap-2">
                            <FiSave /> حفظ المظهر
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
