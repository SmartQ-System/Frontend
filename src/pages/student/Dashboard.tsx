import { useState, useEffect } from 'react';
import { progressApi } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';
import { FiActivity, FiAward, FiClock, FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await progressApi.getStats();
      setStats(res.data.stats);
      setRecentActivity(res.data.recentActivity);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-theme-main text-center p-8">جاري التحميل...</div>;

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-theme-main">مرحباً، {user?.name || user?.email?.split('@')[0]} 👋</h1>
        <p className="text-theme-muted">تابع تقدمك وإنجازاتك</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-xl text-blue-500">
            <FiActivity size={32} />
          </div>
          <div>
            <h3 className="text-theme-muted">عدد الأسئلة</h3>
            <p className="text-3xl font-bold text-theme-main">{stats?.totalAnswered}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl text-green-500">
            <FiAward size={32} />
          </div>
          <div>
            <h3 className="text-theme-muted">الإجابات الصحيحة</h3>
            <p className="text-3xl font-bold text-theme-main">{stats?.totalCorrect}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 rounded-xl text-purple-500">
            <div className="text-2xl font-bold">{stats?.accuracy}%</div>
          </div>
          <div>
            <h3 className="text-theme-muted">دقة الإجابات</h3>
            <p className="text-sm text-theme-muted">استمر في التحسن!</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => navigate('/quiz')}
          className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 rounded-2xl cursor-pointer transform hover:scale-[1.02] transition-all shadow-lg flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">ابدأ تحدي جديد</h2>
            <p className="text-green-100">اختبر معلوماتك في أسئلة عشوائية</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <FiPlay size={32} className="text-white" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/leaderboard')}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 p-8 rounded-2xl cursor-pointer transform hover:scale-[1.02] transition-all shadow-lg flex items-center justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2 text-white">لوحة الصدارة</h2>
            <p className="text-yellow-100">شاهد ترتيبك بين الطلاب</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <FiAward size={32} className="text-white" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-theme-main">
          <FiClock /> آخر الأنشطة
        </h2>
        
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <p className="text-theme-muted text-center py-4">لا توجد نشاطات حديثة</p>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={idx} className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                 <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${activity.isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                        <p className="font-semibold text-theme-main">{activity.question.questionText.substring(0, 50)}...</p>
                        <p className="text-xs text-theme-muted">
                            {new Date(activity.answeredAt).toLocaleDateString('ar-EG')}
                        </p>
                    </div>
                 </div>
                 <span className={`px-3 py-1 rounded text-sm ${activity.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {activity.isCorrect ? 'صحيح' : 'خطأ'}
                 </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
