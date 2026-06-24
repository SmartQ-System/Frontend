import { FiAlertTriangle } from 'react-icons/fi'
import { useThemeStore } from '../../stores/themeStore'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  type = 'danger'
}: ConfirmModalProps) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-sm transform transition-all scale-100">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${
            type === 'danger' ? 'bg-red-500/10 text-red-500' : 
            type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 
            'bg-blue-500/10 text-blue-500'
          }`}>
            <FiAlertTriangle className="text-xl" />
          </div>
          <h3 className="text-xl font-bold text-theme-main">{title}</h3>
        </div>
        
        <p className="text-theme-muted mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' :
              type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
              'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
