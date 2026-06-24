import { Link } from 'react-router-dom';
import { FiPlay, FiLogIn, FiUserPlus, FiChevronRight, FiBook, FiZap } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import ThemeToggle from '../components/ThemeToggle';
import mindIcon from '../assets/mind.png';
import prizeIcon from '../assets/prize.png';
import timerIcon from '../assets/timer.png';
import checkPointIcon from '../assets/check_point.png';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-theme-main overflow-x-hidden">
      {/* Topbar / Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? isDark 
            ? 'bg-gray-900/95 backdrop-blur-lg shadow-xl border-b border-gray-700/50' 
            : 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/30 transition-all">
                <FiBook className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                SmartQ
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-3 md:gap-4">
              <ThemeToggle />
              <Link 
                to="/login" 
                className={`flex items-center gap-2 px-4 py-2 text-sm md:text-base transition-colors rounded-lg ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/5' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FiLogIn className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
                <span className="sm:hidden">دخول</span>
              </Link>
              <Link 
                to="/register" 
                className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
              >
                <FiUserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">إنشاء حساب</span>
                <span className="sm:hidden">تسجيل</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
          }`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
            isDark ? 'bg-indigo-600/20' : 'bg-indigo-400/20'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500 ${
            isDark ? 'bg-pink-600/10' : 'bg-pink-400/10'
          }`}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm mb-8 animate-fade-in ${
            isDark 
              ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-300' 
              : 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200 text-purple-600'
          }`}>
            <FiZap className="w-4 h-4" />
            <span>منصة الاختبارات التفاعلية الأولى</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="block mb-2">اختبر معلوماتك</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              بطريقة ممتعة وذكية
            </span>
          </h1>

          {/* Description */}
          <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            انضم إلى آلاف الطلاب واختبر مهاراتك في بيئة تفاعلية مع أسئلة متنوعة ونظام تتبع تقدم متقدم
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register" 
              className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              <FiPlay className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              <span>ابدأ الآن</span>
              <FiChevronRight className="w-5 h-5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
            <Link 
              to="/login" 
              className={`flex items-center gap-2 px-8 py-4 border rounded-2xl font-medium text-lg transition-all ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FiLogIn className="w-5 h-5" />
              <span>لدي حساب بالفعل</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-lg mx-auto relative">
             <img src={checkPointIcon} alt="Milestone" className="absolute -top-16 -right-16 w-24 h-24 animate-pulse-filter opacity-80 hidden md:block rotate-12" />
            <div className={`text-center p-4 rounded-2xl border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/80 border-gray-200 shadow-sm'
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">+1000</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>سؤال</div>
            </div>
            <div className={`text-center p-4 rounded-2xl border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/80 border-gray-200 shadow-sm'
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-indigo-400 mb-1">+500</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>طالب</div>
            </div>
            <div className={`text-center p-4 rounded-2xl border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/80 border-gray-200 shadow-sm'
            }`}>
              <div className="text-2xl md:text-3xl font-bold text-pink-400 mb-1">+50</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>تصنيف</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-2 ${
            isDark ? 'border-white/20' : 'border-gray-300'
          }`}>
            <div className={`w-1 h-2 rounded-full animate-pulse ${
              isDark ? 'bg-white/50' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              لماذا SmartQ؟
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Diverse Questions */}
            <div className={`group p-8 rounded-3xl border transition-all hover:shadow-xl relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-purple-500/30 hover:shadow-purple-500/10' 
                : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-purple-100'
            }`}>
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                <img src={mindIcon} alt="Smart Learning" className="w-24 h-24 mx-auto animate-float drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">أسئلة متنوعة</h3>
              <p className={isDark ? 'text-gray-400 leading-relaxed' : 'text-gray-600 leading-relaxed'}>
                مجموعة واسعة من الأسئلة في مختلف المجالات والمستويات لتناسب جميع الطلاب
              </p>
            </div>

            {/* Feature 2 - Interactive Experience */}
            <div className={`group p-8 rounded-3xl border transition-all hover:shadow-xl relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-indigo-500/30 hover:shadow-indigo-500/10' 
                : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-indigo-100'
            }`}>
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                <img src={timerIcon} alt="Interactive" className="w-24 h-24 mx-auto animate-float-delay drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">تجربة تفاعلية</h3>
              <p className={isDark ? 'text-gray-400 leading-relaxed' : 'text-gray-600 leading-relaxed'}>
                واجهة حديثة مع مؤقت ذكي ومؤثرات بصرية تجعل التعلم ممتعاً ومشوقاً
              </p>
            </div>

            {/* Feature 3 - Progress Tracking */}
            <div className={`group p-8 rounded-3xl border transition-all hover:shadow-xl relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-pink-500/30 hover:shadow-pink-500/10' 
                : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-pink-100'
            }`}>
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                 <img src={prizeIcon} alt="Rewards" className="w-24 h-24 mx-auto animate-float drop-shadow-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">تتبع التقدم</h3>
              <p className={isDark ? 'text-gray-400 leading-relaxed' : 'text-gray-600 leading-relaxed'}>
                تابع مستواك واحصل على جوائز قيمة مع نظام تصنيف ولوحة متصدرين
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`p-12 rounded-3xl border ${
            isDark 
              ? 'bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-purple-500/20' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              جاهز للبدء؟
            </h2>
            <p className={`text-lg mb-8 max-w-xl mx-auto ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              سجّل الآن مجاناً وابدأ رحلتك في اختبار معلوماتك وتطوير مهاراتك
            </p>
            <Link 
              to="/register" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              <FiUserPlus className="w-6 h-6" />
              <span>إنشاء حساب مجاني</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 px-4 ${
        isDark ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto text-center">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} SmartQ - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
