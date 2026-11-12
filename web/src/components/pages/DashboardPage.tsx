import { Link } from '@tanstack/react-router'
import { ArrowUpRight, CircleDollarSign, Plus, ReceiptText, Sprout, Users } from 'lucide-react'
import { useBalances } from '../../hooks/useHouseholdQueries'
import { useBills } from '../../hooks/useHouseholdQueries'
import { formatUSDCents } from '../../lib/money'
import { EmptyState } from '../EmptyState'
import { useHousehold } from '../HouseholdContext'

function formatDate(value: string) {
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function DashboardPage() {
  const {
    activeMembers,
    home,
    homeId,
    homeError,
    homesError,
    isHomePending,
    isHomesPending,
    refreshHomes,
    refreshHome,
  } = useHousehold()
  const bills = useBills(homeId)
  const balances = useBalances(homeId)
  const totalOwed = balances.data?.reduce(
    (total, balance) => total + BigInt(balance.outstandingCents),
    0n,
  )
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
        <section className="welcome-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> YOUR HOME
            </div>
            <h1>Good things are shared.</h1>
            <p className="subheading">We couldn’t load your household.</p>
          </div>
        </section>
        <div className="error-block">
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
      </div>
    )
  }

  if (!home) {
    return (
      <div className="page-wrap">
        <section className="welcome-row">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> YOUR HOME
            </div>
            <h1>Good things are shared.</h1>
            <p className="subheading">A clearer view of what’s shared around the house.</p>
          </div>
          <Link to="/setup" className="button button-primary">
            <Plus size={17} /> Create household
          </Link>
        </section>
        <EmptyState
          icon={<Users size={20} />}
          title="Your household starts here"
          description="Create a household and add the people you share expenses with."
          action={
            <Link to="/setup" className="button button-secondary">
              Set up household <ArrowUpRight size={15} />
            </Link>
          }
        />
      </div>
    )
  }

  const recentBills = [...(bills.data ?? [])]
    .sort(
      (left, right) =>
        new Date(right.createdAt.replace(' ', 'T')).getTime() -
        new Date(left.createdAt.replace(' ', 'T')).getTime(),
    )
    .slice(0, 4)

  return (
    <div className="page-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> YOUR HOME
          </div>
          <h1>{home.name}</h1>
          <p className="subheading">A clearer view of what’s shared around the house.</p>
        </div>
        <Link to="/bills" className="button button-primary">
          <Plus size={17} /> {home.archivedAt ? 'View bills' : 'Add a bill'}
        </Link>
      </section>

      <section className="metric-grid">
        <article className="metric-card metric-highlight">
          <span className="metric-label">TOTAL OUTSTANDING</span>
          <div className="metric-main">
            <span className="metric-icon green">
              <CircleDollarSign size={18} />
            </span>
            <span className="metric-value">
              {balances.isPending ? '…' : totalOwed === undefined ? '—' : formatUSDCents(totalOwed)}
            </span>
          </div>
          <p>{balances.isError ? 'Could not load balances' : 'Across household members'}</p>
        </article>
        <article className="metric-card">
          <span className="metric-label">ACTIVE MEMBERS</span>
          <div className="metric-main">
            <span className="metric-icon">
              <Users size={18} />
            </span>
            <span className="metric-value">{activeMembers.length}</span>
          </div>
          <p>In this household</p>
        </article>
        <article className="metric-card">
          <span className="metric-label">BILLS TRACKED</span>
          <div className="metric-main">
            <span className="metric-icon">
              <ReceiptText size={18} />
            </span>
            <span className="metric-value">
              {bills.isPending ? '…' : (bills.data?.length ?? '—')}
            </span>
          </div>
          <p>{bills.isError ? 'Could not load bills' : 'All time'}</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <div className="card-header">
            <div>
              <h2>Recent bills</h2>
              <p>Keep an eye on shared household spending.</p>
            </div>
            <Link to="/bills" className="text-link">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          {bills.isPending ? (
            <p className="loading-copy">Loading bills…</p>
          ) : bills.isError ? (
            <div className="error-block">
              <p className="form-error" role="alert">
                {bills.error.message}
              </p>
              <button className="button button-secondary" onClick={() => void bills.refetch()}>
                Try again
              </button>
            </div>
          ) : recentBills.length === 0 ? (
            <EmptyState
              icon={<Sprout size={21} />}
              title="No bills yet"
              description="Create a bill to start tracking shared expenses."
              action={
                <Link to="/bills" className="button button-secondary">
                  Create a bill
                </Link>
              }
            />
          ) : (
            <div className="recent-bill-list">
              {recentBills.map((bill) => (
                <div className="recent-bill-row" key={bill.id}>
                  <span className="bill-icon">
                    <ReceiptText size={17} />
                  </span>
                  <div>
                    <b>{bill.title}</b>
                    <small>{formatDate(bill.createdAt)}</small>
                  </div>
                  <strong>{formatUSDCents(bill.totalCents)}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="content-card">
          <div className="card-header">
            <div>
              <h2>Member balances</h2>
              <p>See what everyone has outstanding.</p>
            </div>
            <Link to="/balances" className="text-link">
              Details <ArrowUpRight size={15} />
            </Link>
          </div>
          {balances.isPending ? (
            <p className="loading-copy">Loading member balances…</p>
          ) : balances.isError ? (
            <p className="form-error" role="alert">
              {balances.error.message}
            </p>
          ) : balances.data.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="No members to show"
              description="Add household members to see their balances."
            />
          ) : (
            <div className="mini-balance-list">
              {balances.data.map((balance) => (
                <div className="balance-row" key={balance.memberId}>
                  <span className="member-avatar">{balance.name.charAt(0).toUpperCase()}</span>
                  <b>{balance.name}</b>
                  <strong className={balance.outstandingCents ? 'amount-due' : 'amount-clear'}>
                    {formatUSDCents(balance.outstandingCents)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
