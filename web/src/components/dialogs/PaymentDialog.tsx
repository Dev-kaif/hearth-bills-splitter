import { useRef, useState } from 'react'
import { usePayShare } from '../../hooks/useMutations'
import type { BillShare } from '../../lib/api/types'
import { formatUSDCents } from '../../lib/money'
import { useHousehold } from '../HouseholdContext'
import { Dialog } from './Dialog'

export function PaymentDialog({
  open,
  onClose,
  billId,
  share,
}: {
  open: boolean
  onClose: () => void
  billId: string
  share: BillShare | null
}) {
  const { homeId } = useHousehold()
  const paymentAttemptKey = useRef<string | null>(null)
  const [error, setError] = useState('')
  const mutation = usePayShare(homeId ?? '')
  const pay = async () => {
    if (!share) return
    paymentAttemptKey.current ??= crypto.randomUUID()
    setError('')
    try {
      await mutation.mutateAsync({ billId, shareId: share.id, key: paymentAttemptKey.current })
      paymentAttemptKey.current = null
      onClose()
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Payment could not be recorded. Try again.',
      )
    }
  }
  return (
    <Dialog
      open={open && share !== null}
      onClose={onClose}
      title="Confirm payment"
      description="This will mark this share as paid for the household."
    >
      <div className="payment-confirm">
        <span className="member-avatar large">
          {share?.memberName?.charAt(0).toUpperCase() ?? '?'}
        </span>
        <div>
          <span>Payment for</span>
          <b>{share?.memberName ?? 'Household member'}</b>
        </div>
        <strong>{share ? formatUSDCents(share.amountCents) : ''}</strong>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button className="button button-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          className="button button-primary"
          onClick={() => void pay()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Recording…' : 'Confirm payment'}
        </button>
      </div>
    </Dialog>
  )
}
