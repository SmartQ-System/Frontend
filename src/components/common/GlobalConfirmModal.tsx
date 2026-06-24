import { useUiStore } from '../../stores/uiStore';
import { useThemeStore } from '../../stores/themeStore';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function GlobalConfirmModal() {
  const { confirmModal, closeConfirm } = useUiStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { isOpen, options } = confirmModal;

  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    closeConfirm();
  };

  const getIcon = () => {
    switch (options.variant) {
      case 'danger':
        return <FiAlertTriangle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <FiAlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <FiInfo className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (options.variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div 
            className={`fixed inset-0 transition-opacity ${isDark ? 'bg-gray-900/75' : 'bg-black/50'}`}
            onClick={closeConfirm}
        />

        {/* Modal Panel */}
        <div className="card relative transform overflow-hidden text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                  options.variant === 'danger' ? 'bg-red-500/10' : 
                  options.variant === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
              }`}>
                {getIcon()}
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-right w-full">
                <h3 className="text-lg font-semibold leading-6 text-theme-main">
                  {options.title || 'تأكيد الإجراء'}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-theme-muted">
                    {options.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={`px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <button
              type="button"
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all ${getButtonColor()}`}
              onClick={handleConfirm}
            >
              {options.confirmLabel || 'تأكيد'}
            </button>
            <button
              type="button"
              className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:mt-0 sm:w-auto transition-all ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 ring-1 ring-inset ring-gray-600 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-300'
              }`}
              onClick={handleCancel}
            >
              {options.cancelLabel || 'إلغاء'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
