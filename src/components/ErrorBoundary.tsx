import { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-2xl mb-6">
              <FiAlertTriangle className="text-4xl text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-3">حدث خطأ غير متوقع</h1>
            <p className="text-gray-400 mb-6">
              عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى إعادة المحاولة.
            </p>
            
            {this.state.error && (
              <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-left text-xs text-red-400 mb-6 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <FiRefreshCw />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
