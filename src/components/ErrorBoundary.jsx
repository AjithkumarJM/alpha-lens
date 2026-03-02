import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.state = { hasError: true, error, errorInfo }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="card p-8 max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <h1 className="text-2xl font-bold text-red-900 dark:text-red-300 mb-4">
              Something went wrong
            </h1>
            <p className="text-red-800 dark:text-red-400 mb-4">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <details className="text-sm text-red-700 dark:text-red-500">
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <pre className="bg-red-100 dark:bg-red-900/40 p-4 rounded overflow-auto">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
