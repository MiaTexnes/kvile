import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render-time errors anywhere below it so a single thrown component
 * shows an accessible recovery message instead of a blank white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div role="alert" className="w-full rounded-2xl border border-red-300 bg-red-50 px-6 py-8 text-red-900">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-sm leading-relaxed">
            An unexpected error stopped this page from loading. You can return home and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Back to home
          </button>
        </div>
      </main>
    )
  }
}
