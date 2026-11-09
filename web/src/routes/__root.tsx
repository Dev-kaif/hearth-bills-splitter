import { createRootRoute, Navigate, Outlet, useRouterState } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { HouseholdProvider } from '../components/HouseholdContext'
import { authClient } from '../lib/auth/client'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const session = authClient.useSession()
  const isPublicRoute = ['/', '/login', '/signup'].includes(pathname)

  if (isPublicRoute) {
    return <Outlet />
  }

  if (session.isPending) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <LoaderCircle className="auth-spinner" />
        <span>Opening your household…</span>
      </div>
    )
  }

  if (!session.data?.user) {
    return <Navigate to="/login" />
  }

  return (
    <HouseholdProvider>
      <AppShell />
    </HouseholdProvider>
  )
}
