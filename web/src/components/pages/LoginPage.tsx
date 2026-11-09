import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authClient } from '../../lib/auth/client'
import { AuthFrame } from '../public/AuthFrame'

export function LoginPage() {
  const navigate = useNavigate()
  const { refetch } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: '/dashboard',
      })

      if (result.error) {
        setError(
          result.error.message || 'We couldn’t sign you in. Check your details and try again.',
        )
        return
      }

      await refetch()
      await navigate({ to: '/dashboard' })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to reach the sign-in service.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame
      eyebrow="WELCOME BACK"
      title="Good to have you home."
      description="Sign in to pick up right where your household left off."
      footer={
        <>
          New to hearth? <Link to="/signup">Create an account</Link>
        </>
      }
    >
      <Card className="auth-card">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Use the email and password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <Label htmlFor="login-email">Email address</Label>
              <Input
                id="login-email"
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
              <div className="auth-label-row">
                <Label htmlFor="login-password">Password</Label>
                <span>At least 8 characters</span>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting ? <ArrowRight /> : null}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthFrame>
  )
}
