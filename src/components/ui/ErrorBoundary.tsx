'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="bg-surface rounded-card shadow-card border border-border/50 p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-danger" />
            </div>
            <h2 className="font-heading font-semibold text-dark-700 text-lg mb-2">
              Algo deu errado
            </h2>
            <p className="font-body text-sm text-dark-400 mb-6 line-clamp-3">
              {this.state.error?.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 bg-primary text-dark font-heading font-semibold rounded-lg px-5 py-2.5 hover:bg-primary-500 transition-colors"
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
