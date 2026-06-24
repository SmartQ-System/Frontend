import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../stores/themeStore';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-xl
        transition-all duration-300
        hover:scale-105 active:scale-95
        ${isDark 
          ? 'bg-gray-800/80 hover:bg-gray-700/80 text-yellow-400' 
          : 'bg-white/80 hover:bg-gray-100/80 text-indigo-600 shadow-md'
        }
        backdrop-blur-sm border
        ${isDark ? 'border-gray-700' : 'border-gray-200'}
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <FiSun 
          className={`
            absolute inset-0 w-5 h-5
            transition-all duration-300
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        {/* Moon icon */}
        <FiMoon 
          className={`
            absolute inset-0 w-5 h-5
            transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
    </button>
  );
}
