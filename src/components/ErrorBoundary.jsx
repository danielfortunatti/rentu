import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary] Error capturado:', error)
      console.error('[ErrorBoundary] Información del componente:', errorInfo)
    }
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-warm-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-700 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 mb-2">
              Algo salió mal
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
