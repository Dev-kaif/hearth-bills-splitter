import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Brand } from './Brand'

export function AuthFrame({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <main className="auth-page">
      <header className="auth-header">
        <Brand />
        <Link to="/" className="auth-home-link">
          Back to home
        </Link>
      </header>
      <section className="auth-stage">
        <div className="auth-decoration" aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
        <div className="auth-panel-wrap">
          <div className="auth-eyebrow">
            <span /> {eyebrow}
          </div>
          <h1>{title}</h1>
          <p className="auth-intro">{description}</p>
          <div className="auth-panel">{children}</div>
          <p className="auth-footer-note">{footer}</p>
        </div>
      </section>
      <footer className="auth-legal">Your household details are only shared with your home.</footer>
    </main>
  )
}
