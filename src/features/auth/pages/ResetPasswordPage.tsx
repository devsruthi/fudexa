import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Button, FormField, PasswordInput, Spinner } from '@/components/ui'
import { useAuth } from '@/features/auth/hooks'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/schemas'
import { supabase } from '@/lib/supabase'
import { PATHS } from '@/routes/paths'

export function ResetPasswordPage() {
  const { resetPassword, user, getPostAuthRedirect } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setHasRecoverySession(Boolean(data.session))
      setCheckingSession(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasRecoverySession(true)
        setCheckingSession(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await resetPassword({ password: values.password })
      const redirect = getPostAuthRedirect() ?? (user ? undefined : PATHS.auth.login)
      navigate(redirect || PATHS.auth.login, { replace: true })
    } catch {
      // Toast handled in auth context
    } finally {
      setSubmitting(false)
    }
  })

  if (checkingSession) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Preparing reset…" />
      </div>
    )
  }

  if (!hasRecoverySession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Reset link invalid
        </h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Request a new one to continue.
        </p>
        <Link
          to={PATHS.auth.forgotPassword}
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Request a new link
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          label="New password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters, mixed case, and a number"
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            placeholder="••••••••"
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            hasError={Boolean(errors.confirmPassword)}
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" className="w-full" loading={submitting}>
          Update password
        </Button>
      </form>
    </motion.div>
  )
}
