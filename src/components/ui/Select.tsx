import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiCheck } from 'react-icons/fi'
import { useThemeStore } from '../../stores/themeStore'

interface Option {
  id: string | number
  name: string
  [key: string]: any
}

interface SelectProps {
  options: Option[]
  value: string | number | undefined
  onChange: (value: any) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  className = '',
  disabled = false,
  label,
}: SelectProps) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.id === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-theme-muted text-sm mb-2">{label}</label>}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-right flex items-center justify-between
          rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          ${isDark 
            ? 'bg-gray-800 border border-gray-600 text-white hover:border-gray-500' 
            : 'bg-white border border-gray-300 text-gray-900 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-purple-500 border-transparent' : ''}
        `}
      >
        <span className={selectedOption ? 'text-theme-main' : 'text-theme-muted'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <FiChevronDown 
          className={`text-theme-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-xl shadow-xl max-h-60 overflow-auto animate-slide-up ${
          isDark 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {options.length === 0 ? (
            <div className="px-4 py-3 text-theme-muted text-center text-sm">لا توجد خيارات</div>
          ) : (
            <ul className="py-1">
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.id)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full px-4 py-2 text-right flex items-center justify-between
                      transition-colors
                      ${option.id === value 
                        ? 'text-purple-500 bg-purple-500/10' 
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700/50'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span>{option.name}</span>
                    {option.id === value && <FiCheck className="text-purple-500" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
