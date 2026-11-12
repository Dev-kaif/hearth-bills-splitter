import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarDays, CircleAlert, Plus, ReceiptText, Users } from 'lucide-react'
import type { BillShare } from '../../lib/api/types'
import { formatUSDCents } from '../../lib/money'
import { useBills } from '../../hooks/useHouseholdQueries'
import { BillDialog } from '../dialogs/BillDialog'
import { PaymentDialog } from '../dialogs/PaymentDialog'
import { EmptyState } from '../EmptyState'
import { useHousehold } from '../HouseholdContext'

function displayDate(value: string): string {
  const date = new Date(value.replace(' ', 'T'))
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        date,
      )
}

export function BillsPage() {
  const {
    home,
    homeId,
    activeMembers,
    isHomesPending,
    isHomePending,
    homesError,
    homeError,
    refreshHomes,
    refreshHome,
  } = useHousehold()
  const bills = useBills(homeId)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [payment, setPayment] = useState<{ billId: string; share: BillShare } | null>(null)
  const canCreateBill = Boolean(home && !home.archivedAt && activeMembers.length > 0)
  const loadError = homesError ?? homeError
  const loadingHome = isHomesPending || Boolean(homeId && isHomePending)
  return (
    <div className="page-wrap">
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> HOUSEHOLD SPENDING
          </div>
          <h1>Bills</h1>
          <p className="subheading">A shared record of the things that keep home running.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setDialogOpen(true)}
          disabled={!canCreateBill}
        >
          <Plus size={17} /> Add a bill
        </button>
      </section>
      {loadError ? (
        <div className="content-card">
          <p className="form-error" role="alert">
            {loadError.message}
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
      ) : loadingHome ? (
        <div className="content-card">
          <p className="loading-copy">Loading household…</p>
        </div>
      ) : !home ? (
        <div className="content-card">
          <EmptyState
            icon={<Users size={20} />}
            title="Set up your household first"
            description="Create a household and add its members before you can add a bill."
            action={
              <Link to="/setup" className="button button-primary">
                Set up household
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {home.archivedAt && (
            <div className="archive-notice" role="status">
              This household is archived. You can review its bills, but can’t create new ones.
            </div>
          )}
          <div className="content-card bills-history">
            <div className="card-header">
              <div>
                <h2>All bills</h2>
                <p>Every shared expense, in one place.</p>
              </div>
              <span className="table-period">
                <CalendarDays size={15} />
                {bills.data?.length ?? 0} bills
              </span>
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
            ) : bills.data.length === 0 ? (
              <EmptyState
                icon={<ReceiptText size={21} />}
                title="No bills yet"
                description={
                  activeMembers.length
                    ? 'Create your first bill and the backend will split it across active household members.'
                    : 'Add active household members before creating a bill.'
                }
                action={
                  activeMembers.length > 0 && !home.archivedAt ? (
                    <button className="button button-secondary" onClick={() => setDialogOpen(true)}>
                      <Plus size={16} /> Create your first bill
                    </button>
                  ) : !home.archivedAt ? (
                    <Link to="/setup" className="button button-secondary">
                      Add members
                    </Link>
                  ) : undefined
                }
              />
            ) : (
              <div className="bill-list">
                {bills.data.map((bill) => {
                  const paidCount = bill.shares.filter((share) => share.paidAt !== null).length
                  const allPaid = bill.shares.length > 0 && paidCount === bill.shares.length
                  return (
                    <article className="bill-detail-card" key={bill.id}>
                      <div className="bill-detail-top">
                        <div className="bill-title-group">
                          <span className="bill-icon">
                            <ReceiptText size={19} />
                          </span>
                          <div>
                            <h2>{bill.title}</h2>
                            <p>
                              {displayDate(bill.createdAt)} · {formatUSDCents(bill.totalCents)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`status-pill ${allPaid ? 'status-paid' : 'status-pending'}`}
                        >
                          <i />
                          {allPaid ? 'Paid' : `${paidCount}/${bill.shares.length} paid`}
                        </span>
                      </div>
                      <div className="shares-heading">
                        <b>Member shares</b>
                        <span>{bill.shares.length} shares</span>
                      </div>
                      {bill.shares.map((share) => {
                        const isPaid = share.paidAt !== null
                        return (
                          <div className="share-row" key={share.id}>
                            <span className="member-avatar">
                              {share.memberName?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                            <div className="share-person">
                              <b>{share.memberName ?? 'Household member'}</b>
                              <small>
                                {share.paidAt ? `Paid ${displayDate(share.paidAt)}` : 'Outstanding'}
                              </small>
                            </div>
                            <strong>{formatUSDCents(share.amountCents)}</strong>
                            {isPaid ? (
                              <span className="status-pill status-paid">
                                <i /> Paid
                              </span>
                            ) : (
                              <button
                                className="button button-small button-secondary"
                                onClick={() => setPayment({ billId: bill.id, share })}
                              >
                                Mark paid
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
      {canCreateBill && (
        <BillDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={() => setDialogOpen(false)}
        />
      )}
      {payment && (
        <PaymentDialog
          open={payment !== null}
          onClose={() => setPayment(null)}
          billId={payment.billId}
          share={payment.share}
        />
      )}
      <div className="subtle-footnote">
        <CircleAlert size={14} /> Payment updates require an active signed-in session.
      </div>
    </div>
  )
}
