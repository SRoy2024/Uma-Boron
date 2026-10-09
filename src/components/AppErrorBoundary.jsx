import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, details) {
    console.error('Uma Boron recovered from an unexpected render error.', error, details)
  }

  reload = () => window.location.reload()

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="fatal-error-shell" role="alert">
        <section className="fatal-error-card">
          <span lang="bn">উমা</span>
          <h1>The experience paused safely.</h1>
          <p>An unexpected browser error was contained before it could break the rest of your visit.</p>
          <button type="button" onClick={this.reload}>Reload Uma Boron</button>
        </section>
      </main>
    )
  }
}
