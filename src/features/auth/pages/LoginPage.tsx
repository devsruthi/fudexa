import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { Button, FormField, Input, PasswordInput } from '@/components/ui'
import { AuthFormPanel } from '@/features/auth/components/AuthFormPanel'
import { useAuth } from '@/features/auth/hooks'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'

const fieldMotion = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35 },
})

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const result = await login(values)
      if (!result.user) return

      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from || getHomePathForRole(result.user.role), { replace: true })
    } catch {
      // Toast handled in auth context
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <AuthFormPanel className="space-y-7">
      <div className="space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-semibold text-[#FF6A00]"
        >
          Welcome back! 👋
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.04 }}
          className="font-display text-[1.85rem] font-semibold tracking-tight text-foreground sm:text-[2.05rem]"
        >
          Sign in to your account
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="text-sm text-muted-foreground"
        >
          Enter your credentials to continue to your workspace.
        </motion.p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <motion.div {...fieldMotion(0.08)}>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                hasError={Boolean(errors.email)}
                placeholder=""
                className="pl-10"
                {...register('email')}
              />
            </div>
          </FormField>
        </motion.div>

        <motion.div {...fieldMotion(0.14)}>
          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3.5 z-[1] size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <PasswordInput
                id="password"
                autoComplete="current-password"
                hasError={Boolean(errors.password)}
                placeholder=""
                className="pl-10"
                {...register('password')}
              />
            </div>
          </FormField>
        </motion.div>

        <motion.div {...fieldMotion(0.2)} className="flex justify-end">
          <Link
            to={PATHS.auth.forgotPassword}
            className="text-sm font-semibold text-[#FF6A00] transition hover:text-primary"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div {...fieldMotion(0.26)}>
          <Button
            type="submit"
            className="h-12 w-full rounded-xl border-0 bg-[linear-gradient(90deg,_#FF7A00_0%,_#E63946_100%)] text-base text-white shadow-[0_12px_28px_-10px_rgb(230_57_70_/_0.55)]"
            loading={submitting}
          >
            <span className="flex w-full items-center justify-center gap-2.5">
              Sign in
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-white/20">
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </span>
          </Button>
        </motion.div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border/80" />
          <span className="text-xs font-medium text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border/80" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link
            to={PATHS.auth.register}
            className="font-semibold text-[#FF6A00] hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthFormPanel>
  )
}
