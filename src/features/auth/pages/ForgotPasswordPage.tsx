import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button, FormField, Input } from '@/components/ui'
import { AuthFormPanel } from '@/features/auth/components/AuthFormPanel'
import { useAuth } from '@/features/auth/hooks'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/schemas'
import { PATHS } from '@/routes/paths'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await forgotPassword(values)
      setSent(true)
    } catch {
      // Toast handled in auth context
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthFormPanel>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
            Account recovery
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Forgot password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 rounded-[var(--radius-lg)] border border-border/80 bg-surface/80 p-5 text-sm text-muted-foreground shadow-[var(--shadow-sm)] backdrop-blur-sm">
            <p className="font-medium text-foreground">Check your inbox</p>
            <p>
              If that email is registered, you&apos;ll receive a password reset link shortly. The
              link expires for security.
            </p>
            <Link
              to={PATHS.auth.login}
              className="inline-block font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                hasError={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <Button type="submit" className="w-full bg-brand-gradient border-0" loading={submitting}>
              Send reset link
            </Button>
          </form>
        )}

        {!sent ? (
          <p className="text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link to={PATHS.auth.login} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        ) : null}
      </motion.div>
    </AuthFormPanel>
  )
}
