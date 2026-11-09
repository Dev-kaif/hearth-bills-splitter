import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useCreateHome } from '../../hooks/useMutations'
import { useHousehold } from '../HouseholdContext'
import { Dialog } from './Dialog'

export function HomeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { selectHome } = useHousehold()
  const navigate = useNavigate()
  const mutation = useCreateHome()
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = name.trim()
    if (!value || value.length > 100) {
      setError('Enter a household name up to 100 characters.')
      return
    }
    setError('')
    try {
      const home = await mutation.mutateAsync({ name: value })
      selectHome(home.id)
      setName('')
      onClose()
      await navigate({ to: '/setup' })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create household.')
    }
  }
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create a household"
      description="Start a shared space for the people and bills you live with."
    >
      <form className="form-stack" onSubmit={submit}>
        <label>
          Household name
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maple Street Flat"
            maxLength={100}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button button-primary full-width" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Create household'}
        </button>
        <p className="form-footnote">You can add household members in the next step.</p>
      </form>
    </Dialog>
  )
}
