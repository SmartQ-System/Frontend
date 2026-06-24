import { useState, useEffect } from 'react';
import { progressApi } from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';
import { FiAward, FiUser } from 'react-icons/fi';

export default function Leaderboard() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await progressApi.getLeaderboard();
      setLeaderboard(res.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
      case 2: return isDark ? 'bg-gray-400/20 border-gray-400 text-gray-300' : 'bg-gray-300/30 border-gray-400 text-gray-600';
      case 3: return 'bg-orange-500/20 border-orange-500 text-orange-500';
      default: return isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-600';
    }
  };

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3 text-theme-main">
          <FiAward className="text-yellow-500" />
          لوحة الصدارة
        </h1>
        <p className="text-theme-muted">أفضل الطلاب أداءً في الاختبارات</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-8 text-theme-main">جاري التحميل...</div>
        ) : leaderboard.length === 0 ? (
          <div className="card text-center py-12">
            <FiAward className="text-6xl text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-muted mb-2">لا توجد نتائج بعد</h3>
            <p className="text-theme-muted">ابدأ اختباراً لتظهر في لوحة الصدارة!</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div 
              key={entry.rank}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold w-12 text-center">
                  {getMedal(entry.rank)}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <FiUser />
                  </div>
                  <span className="font-bold text-lg text-theme-main">{entry.user.email}</span>
                </div>
              </div>
              
              <div className="text-xl font-mono font-bold">
                {entry.score} <span className="text-sm font-normal opacity-70">نقطة</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
