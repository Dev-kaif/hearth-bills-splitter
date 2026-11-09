import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Activity,
  House,
  ReceiptText,
  Users,
  CircleUserRound,
  Plus,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../lib/auth/client'
import { HomeDialog } from './dialogs/HomeDialog'
import { useHousehold } from './HouseholdContext'

const nav = [
  { to: '/dashboard', label: 'Overview', icon: House },
  { to: '/bills', label: 'Bills', icon: ReceiptText },
  { to: '/balances', label: 'Balances', icon: Activity },
  { to: '/setup', label: 'Household', icon: Users },
  { to: '/account', label: 'Account', icon: CircleUserRound },
] as const

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [homeOpen, setHomeOpen] = useState(false)

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const session = authClient.useSession()
  const navigate = useNavigate()
  const { home, homes, homeId, selectHome, isHomesPending } = useHousehold()
  const user = session.data?.user
  const name = user?.name || user?.email || 'Your account'

  const signOut = async () => {
    await authClient.signOut()
    await navigate({ to: '/' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">h</span>
          <span>
            hearth<span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="home-switcher">
          <span className="home-avatar">{home?.name.charAt(0).toUpperCase() ?? 'H'}</span>
          {homes?.length ? (
            <label className="home-select-wrap">
              <span className="sr-only">Select household</span>
              <select
                value={homeId ?? ''}
                onChange={(event) => selectHome(event.target.value)}
                disabled={isHomesPending}
              >
                {homes.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <small>{home ? 'Active household' : 'Loading household…'}</small>
            </label>
          ) : (
            <Link to="/setup" className="home-select-wrap">
              <b>{isHomesPending ? 'Loading homes…' : 'No household'}</b>
              <small>{isHomesPending ? 'Your homes' : 'Create a home'}</small>
            </Link>
          )}
        </div>
        <p className="nav-caption">MENU</p>
        <nav className="primary-nav">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`nav-link ${pathname === to ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Balances' && <span className="nav-indicator" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link" onClick={() => setHomeOpen(true)}>
            <Plus size={18} />
            <span>Create household</span>
          </button>
          <button className="profile-chip" onClick={() => void signOut()}>
            <span className="profile-avatar">{name.charAt(0).toUpperCase()}</span>
            <span className="profile-copy">
              <b>{name}</b>
              <small>Sign out</small>
            </span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button
            className="mobile-brand"
            aria-label="Open navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
            <span>
              hearth<span className="brand-dot">.</span>
            </span>
          </button>
          <div className="topbar-title">
            {nav.find((item) => item.to === pathname)?.label ?? 'Bill details'}
          </div>
          <div className="topbar-right">
            <Link to="/account" className="avatar-button" aria-label="Account">
              {name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>
        {menuOpen && (
          <div className="mobile-menu">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${pathname === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <button
              className="nav-link"
              onClick={() => {
                setMenuOpen(false)
                setHomeOpen(true)
              }}
            >
              <Plus size={18} />
              Create household
            </button>
          </div>
        )}
        <main className="page-content">
          <Outlet />
        </main>
        <nav className="bottom-nav">
          {nav.slice(0, 4).map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={pathname === to ? 'active' : ''}>
              <Icon size={19} />
              <small>{label === 'Overview' ? 'Home' : label}</small>
            </Link>
          ))}
        </nav>
      </div>
      <HomeDialog open={homeOpen} onClose={() => setHomeOpen(false)} />
    </div>
  )
}
