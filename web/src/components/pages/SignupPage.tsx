import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '../../lib/auth/client'
import { AuthFrame } from '../public/AuthFrame'

export function SignupPage() {
  const navigate = useNavigate()
  const { refetch } = authClient.useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Those passwords don’t match yet.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        setError(result.error.message || 'We couldn’t create your account. Please try again.')
        return
      }

      await refetch()
      await navigate({ to: '/setup' })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to reach the sign-up service.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="MAKE YOURSELF AT HOME"
      title="Let’s make sharing simpler."
      description="Create your account, then set up the home you share."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <Card className="auth-card">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>It only takes a moment to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <Label htmlFor="signup-name">Your name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="How should we address you?"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="signup-email">Email address</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="signup-confirm-password">Confirm password</Label>
              <Input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="auth-spinner" /> : null}
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting ? <ArrowRight /> : null}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthFrame>
  )
}
