import { useState } from 'react'
import { useCreateBill } from '../../hooks/useMutations'
import { parseRupeesToPaise } from '../../lib/money'
import type { CreatedBill } from '../../lib/api/types'
import { useHousehold } from '../HouseholdContext'
import { Dialog } from './Dialog'

export function BillDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (bill: CreatedBill) => void
}) {
  const { homeId } = useHousehold()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const mutation = useCreateBill(homeId ?? '')
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const cleanTitle = title.trim()
    const cents = parseRupeesToPaise(amount)
    if (!cleanTitle || cleanTitle.length > 160) {
      setError('Enter a bill title up to 160 characters.')
      return
    }
    if (cents === null) {
      setError('Enter a positive amount with up to two decimal places.')
      return
    }
    setError('')
    try {
      const bill = await mutation.mutateAsync({ title: cleanTitle, totalCents: cents })
      onCreated(bill)
      setTitle('')
      setAmount('')
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create bill.')
    }
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add a bill"
      description="The total is split equally among your household members."
    >
      <form className="form-stack" onSubmit={submit}>
        <label>
          Bill title
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Electricity"
            maxLength={160}
          />
        </label>
        <label>
          Total amount
          <div className="money-input">
            <span>₹</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              aria-label="Total amount in rupees"
            />
          </div>
          <small>Enter rupees and paise, for example 1250.50.</small>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button button-primary full-width" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create bill'}
        </button>
      </form>
    </Dialog>
  )
}
