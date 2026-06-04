import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map3D Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-bg-primary text-text-secondary">
          <div className="text-center p-4">
            <p className="text-lg font-semibold mb-2">3D Map unavailable</p>
            <p className="text-sm">{this.state.error?.message || 'Unknown error'}</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
