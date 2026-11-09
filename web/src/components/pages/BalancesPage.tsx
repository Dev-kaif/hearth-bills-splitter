import { Link } from '@tanstack/react-router'
import { CircleDollarSign, Users } from 'lucide-react'
import { useBalances } from '../../hooks/useHouseholdQueries'
import { formatINR } from '../../lib/money'
import { EmptyState } from '../EmptyState'
import { useHousehold } from '../HouseholdContext'

export function BalancesPage() {
  const {
    home,
    homeId,
    homeError,
    homesError,
    isHomePending,
    isHomesPending,
    refreshHome,
    refreshHomes,
  } = useHousehold()
  const balances = useBalances(homeId)
  const total = balances.data?.reduce((sum, balance) => sum + balance.outstandingCents, 0)
  const loadingHousehold = isHomesPending || Boolean(homeId && isHomePending)
  const householdError = homesError ?? homeError

  if (loadingHousehold) {
    return (
      <div className="page-wrap">
        <p className="loading-copy">Loading your household…</p>
      </div>
    )
  }

  if (householdError) {
    return (
      <div className="page-wrap">
        <p className="form-error" role="alert">
          {householdError.message}
        </p>
        <button
          className="button button-secondary"
          onClick={() =>
            void Promise.all([refreshHomes(), homeId ? refreshHome() : Promise.resolve()])
          }
        >
          Try again
        </button>
      </div>
    )
  }

  if (!home) {
    return (
      <div className="page-wrap">
        <EmptyState
          icon={<Users size={20} />}
          title="Start with a household"
          description="Set up your household to see each member’s outstanding balance."
          action={
            <Link to="/setup" className="button button-primary">
              Set up household
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="page-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE HOUSEHOLD LEDGER
          </div>
          <h1>Balances</h1>
          <p className="subheading">A simple, fair view of what’s still owed.</p>
        </div>
      </section>

      <div className="balance-summary">
        <span className="metric-icon green">
          <CircleDollarSign size={18} />
        </span>
        <div>
          <span className="metric-label">TOTAL OUTSTANDING</span>
          <b>{balances.isPending ? '…' : total === undefined ? '—' : formatINR(total)}</b>
        </div>
        <small>Sum of unpaid member shares</small>
      </div>

      <section className="content-card balance-card">
        <div className="card-header">
          <div>
            <h2>Member balances</h2>
            <p>Every member stays listed, including those at zero.</p>
          </div>
        </div>
        {balances.isPending ? (
          <p className="loading-copy">Loading member balances…</p>
        ) : balances.isError ? (
          <div className="error-block">
            <p className="form-error" role="alert">
              {balances.error.message}
            </p>
            <button className="button button-secondary" onClick={() => void balances.refetch()}>
              Try again
            </button>
          </div>
        ) : balances.data.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No members added"
            description="Add everyone who shares expenses in this home."
            action={
              <Link to="/setup" className="button button-secondary">
                Add members
              </Link>
            }
          />
        ) : (
          balances.data.map((balance) => (
            <div className="balance-row" key={balance.memberId}>
              <span className="member-avatar">{balance.name.charAt(0).toUpperCase()}</span>
              <b>{balance.name}</b>
              <strong className={balance.outstandingCents ? 'amount-due' : 'amount-clear'}>
                {formatINR(balance.outstandingCents)}
              </strong>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
