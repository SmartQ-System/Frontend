import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { authApi, settingsApi } from '../../lib/api';
import { FiUser, FiLock, FiSave, FiAlertCircle, FiVolume2, FiLayout } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Available TTS voices
const TTS_VOICES = [
  { id: 'default', name: 'الافتراضي (Google)', gender: 'neutral' },
  { id: 'ar-EG-ShakirNeural', name: 'شاكر (مصري)', gender: 'male' },
  { id: 'ar-EG-SalmaNeural', name: 'سلمى (مصرية)', gender: 'female' },
  { id: 'ar-SA-HamedNeural', name: 'حامد (سعودي)', gender: 'male' },
  { id: 'ar-SA-ZariyahNeural', name: 'زارية (سعودية)', gender: 'female' },
  { id: 'ar-AE-FatimaNeural', name: 'فاطمة (إماراتية)', gender: 'female' },
  { id: 'ar-AE-HamdanNeural', name: 'حمدان (إماراتي)', gender: 'male' },
];

const QUESTION_COLORS = [
  { id: 'red', value: '#ef4444', label: 'أحمر' },
  { id: 'green', value: '#22c55e', label: 'أخضر' },
  { id: 'yellow', value: '#eab308', label: 'أصفر' },
  { id: 'blue', value: '#3b82f6', label: 'أزرق' },
  { id: 'purple', value: '#a855f7', label: 'بنفسجي' },
];

const STORAGE_KEY = 'smartq_voice_preference';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Preferences State
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [questionColor, setQuestionColor] = useState('#22c55e');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await settingsApi.get();
        if (res.data.settings) {
            setSelectedVoice(res.data.settings.voiceId || 'default');
            setQuestionColor(res.data.settings.questionColor || '#22c55e');
            localStorage.setItem(STORAGE_KEY, res.data.settings.voiceId || 'default');
        }
    } catch (error) {
        console.error('Failed to fetch settings');
    }
  };

  const handleVoiceChange = async (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(STORAGE_KEY, voiceId);
    try {
        await settingsApi.update({ voiceId });
        toast.success('تم حفظ تفضيل الصوت');
    } catch (error) {
        toast.error('فشل حفظ التفضيل');
    }
  };

  const handleColorChange = async (color: string) => {
    setQuestionColor(color);
    try {
        await settingsApi.update({ questionColor: color });
        toast.success('تم تغيير لون الأسئلة');
    } catch (error) {
        toast.error('فشل حفظ اللون');
    }
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile({ name });
      setUser(res.data.user);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث الملف الشخصي');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      toast.success('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg transform rotate-3">
            <FiUser className="w-8 h-8 text-white" />
        </div>
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            الملف الشخصي
            </h1>
            <p className="text-theme-muted mt-1">إعدادات الحساب والأمان</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="card">
            <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <FiUser className="text-purple-500 text-xl" />
                <h2 className="text-xl font-bold text-theme-main">المعلومات الشخصية</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                    <label className="block text-theme-muted mb-2">البريد الإلكتروني</label>
                    <input 
                        type="email" 
                        value={user?.email} 
                        disabled 
                        className="input-field opacity-60 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-theme-muted mb-2">الاسم</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="أدخل اسمك"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={profileLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {profileLoading ? 'جاري الحفظ...' : <><FiSave /> حفظ التغييرات</>}
                </button>
            </form>
        </div>

        {/* Password Change */}
        <div className="card">
            <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <FiLock className="text-red-500 text-xl" />
                <h2 className="text-xl font-bold text-theme-main">تغيير كلمة المرور</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                    <label className="block text-theme-muted mb-2">كلمة المرور الحالية</label>
                    <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="input-field"
                        placeholder="********"
                    />
                </div>
                <div>
                    <label className="block text-theme-muted mb-2">كلمة المرور الجديدة</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="input-field"
                        placeholder="********"
                    />
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex gap-2 items-start text-sm text-yellow-600 dark:text-yellow-300">
                    <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                    <span>يجب أن تكون كلمة المرور 6 أحرف على الأقل.</span>
                </div>
                <button 
                    type="submit" 
                    disabled={passwordLoading}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                    {passwordLoading ? 'جاري التحديث...' : <><FiLock /> تحديث كلمة المرور</>}
                </button>
            </form>
        </div>

        {/* Preferences Section */}
        <div className="card md:col-span-2">
            <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <FiLayout className="text-green-500 text-xl" />
                <h2 className="text-xl font-bold text-theme-main">تفضيلات الاختبار</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Voice */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-theme-body font-medium">
                        <FiVolume2 /> صوت القارئ
                    </div>
                    <div className="space-y-2">
                        {TTS_VOICES.map((voice) => (
                            <button
                                key={voice.id}
                                onClick={() => handleVoiceChange(voice.id)}
                                className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${
                                    selectedVoice === voice.id
                                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                                        : isDark 
                                            ? 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                <span>{voice.name}</span>
                                {selectedVoice === voice.id && <span>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-theme-body font-medium">
                        <FiLayout /> لون الأسئلة
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {QUESTION_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => handleColorChange(color.value)}
                                className={`w-12 h-12 rounded-full border-4 transition-all transform hover:scale-110 ${
                                    questionColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                    <div className={`p-4 rounded-xl border mt-4 ${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <p className="text-sm text-theme-muted mb-2">معاينة:</p>
                        <h3 className="text-xl font-bold text-center" style={{ color: questionColor }}>
                            لماذا تبدو السماء زرقاء؟
                        </h3>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
