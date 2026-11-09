import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CircleUserRound, LogOut, ShieldCheck } from 'lucide-react'
import { authClient } from '../../lib/auth/client'

export function AccountPage() {
  const session = authClient.useSession()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const user = session.data?.user
  const signOut = async () => {
    setError('')
    const result = await authClient.signOut()
    if (result.error) {
      setError(result.error.message ?? 'Could not sign out.')
      return
    }
    await navigate({ to: '/' })
    window.location.reload()
  }
  return (
    <div className="page-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> YOUR PROFILE
          </div>
          <h1>Account</h1>
          <p className="subheading">Your sign-in details and account controls.</p>
        </div>
      </section>
      <section className="content-card account-card">
        <div className="account-avatar">
          <CircleUserRound size={28} />
        </div>
        <div className="account-details">
          <span className="metric-label">SIGNED IN AS</span>
          <h2>
            {session.isPending ? 'Loading account…' : user?.name || user?.email || 'Not signed in'}
          </h2>
          {user?.email && <p>{user.email}</p>}
          <span className={`status-pill ${user ? 'status-paid' : 'status-pending'}`}>
            <i />
            {user ? 'Session active' : 'No active session'}
          </span>
        </div>
        {user && (
          <button
            className="button button-secondary account-signout"
            onClick={() => void signOut()}
          >
            <LogOut size={16} /> Sign out
          </button>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </section>
      <div className="integration-notice neutral">
        <ShieldCheck size={19} />
        <div>
          <b>Secure by Better Auth</b>
          <p>Your session and account actions are handled by the existing Better Auth backend.</p>
        </div>
      </div>
    </div>
  )
}
