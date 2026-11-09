import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check, Plus, Users } from 'lucide-react'
import { useCreateHome, useCreateMember } from '../../hooks/useMutations'
import { useHousehold } from '../HouseholdContext'
import { EmptyState } from '../EmptyState'

export function SetupPage() {
  const {
    home,
    homeId,
    members,
    activeMembers,
    selectHome,
    isHomesPending,
    homesError,
    isHomePending,
    homeError,
    refreshHomes,
    refreshHome,
  } = useHousehold()
  const [homeName, setHomeName] = useState('')
  const [memberName, setMemberName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const createHome = useCreateHome()
  const createMemberMutation = useCreateMember(homeId ?? '')
  const submitHome = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = homeName.trim()
    if (!name || name.length > 100) {
      setError('Use a name between 1 and 100 characters.')
      return
    }
    setError('')
    setMessage('')
    try {
      const created = await createHome.mutateAsync({ name })
      selectHome(created.id)
      setHomeName('')
      setMessage('Household created. Add the people who share expenses with you.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create household.')
    }
  }
  const submitMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = memberName.trim()
    if (!name || name.length > 100) {
      setError('Use a name between 1 and 100 characters.')
      return
    }
    setError('')
    setMessage('')
    try {
      await createMemberMutation.mutateAsync({ name })
      setMemberName('')
      setMessage(`${name} added to ${home?.name}.`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add member.')
    }
  }
  const loading = isHomesPending || Boolean(homeId && isHomePending)
  const loadError = homesError ?? homeError
  return (
    <div className="page-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> GETTING STARTED
          </div>
          <h1>Make room for everyone.</h1>
          <p className="subheading">Set up your household in a couple of simple steps.</p>
        </div>
      </section>
      <div className="setup-layout">
        <section className="content-card setup-card">
          <div className="step-heading">
            <span className={`step-number ${home ? 'complete' : ''}`}>
              {home ? <Check size={16} /> : '1'}
            </span>
            <div>
              <h2>{home ? 'Your household' : 'Create your household'}</h2>
              <p>
                {home
                  ? 'The home selected in your household menu.'
                  : 'Give your shared home a name you’ll recognize.'}
              </p>
            </div>
          </div>
          {loading ? (
            <p className="loading-copy">Loading household…</p>
          ) : loadError ? (
            <div className="form-error" role="alert">
              {loadError.message}
              <button
                className="inline-retry"
                onClick={() => void (homeId ? refreshHome() : refreshHomes())}
              >
                Retry
              </button>
            </div>
          ) : home ? (
            <div className="created-home">
              <span className="home-avatar large">{home.name.charAt(0).toUpperCase()}</span>
              <div>
                <b>{home.name}</b>
                <small>
                  {home.archivedAt
                    ? 'Archived household'
                    : `Created ${new Date(home.createdAt.replace(' ', 'T')).toLocaleDateString('en-IN')}`}
                </small>
              </div>
              <Check className="success-icon" size={18} />
            </div>
          ) : homesError ? null : (
            <form className="form-stack" onSubmit={submitHome}>
              <label>
                Household name
                <input
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  placeholder="e.g. Maple Street Flat"
                  maxLength={100}
                />
              </label>
              <button className="button button-primary" disabled={createHome.isPending}>
                {createHome.isPending ? 'Creating…' : 'Create household'}
              </button>
            </form>
          )}
          <div className={`step-heading second-step ${home ? '' : 'muted'}`}>
            <span className={`step-number ${activeMembers.length ? 'complete' : ''}`}>
              {activeMembers.length ? <Check size={16} /> : '2'}
            </span>
            <div>
              <h2>Add household members</h2>
              <p>Everyone you add will get an equal share of new bills.</p>
            </div>
          </div>
          {home && !home.archivedAt && (
            <form className="inline-form" onSubmit={submitMember}>
              <label className="sr-only" htmlFor="member-name">
                Member name
              </label>
              <input
                id="member-name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter a name"
                maxLength={100}
              />
              <button className="button button-primary" disabled={createMemberMutation.isPending}>
                <Plus size={16} />
                {createMemberMutation.isPending ? 'Adding…' : 'Add member'}
              </button>
            </form>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="form-success" role="status">
              {message}
            </p>
          )}
          {home && (
            <div className="member-list">
              {members.map((member) => (
                <div className="member-row" key={member.id}>
                  <span className="member-avatar">{member.name.charAt(0).toUpperCase()}</span>
                  <b>{member.name}</b>
                  {member.archivedAt ? (
                    <span className="archive-label">Archived</span>
                  ) : (
                    <Check className="success-icon" size={16} />
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <EmptyState
                  icon={<Users size={20} />}
                  title="No members added yet"
                  description="Add yourself and the other people in your home to get started."
                />
              )}
            </div>
          )}
          {home && activeMembers.length > 0 && !home.archivedAt && (
            <Link to="/bills" className="button button-primary setup-continue">
              Continue to bills
            </Link>
          )}
        </section>
        <aside className="setup-aside">
          <div className="aside-illustration">
            <span className="illustration-sun" />
            <div className="illustration-house">
              <i />
              <b />
              <em />
            </div>
            <span className="illustration-plant">✳</span>
          </div>
          <h3>A little more in sync.</h3>
          <p>
            Once your household is set up, you can keep shared bills and payments in one calm, clear
            place.
          </p>
          <div className="aside-rule" />
          <span className="aside-small">
            <Check size={15} /> Your information stays yours
          </span>
        </aside>
      </div>
    </div>
  )
}
