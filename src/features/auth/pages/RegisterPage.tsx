import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, UserRound } from 'lucide-react'
import { Button, FormField, Input, PasswordInput } from '@/components/ui'
import { AuthFormPanel } from '@/features/auth/components/AuthFormPanel'
import { useAuth } from '@/features/auth/hooks'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { PATHS } from '@/routes/paths'
import { getHomePathForRole } from '@/routes/role-config'
import { cn } from '@/utils'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      restaurantName: '',
    },
  })

  const role = useWatch({ control, name: 'role' })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const result = await registerUser({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role,
        restaurantName: values.restaurantName,
      })

      if (result.requiresEmailVerification) {
        navigate(PATHS.auth.login, { replace: true })
        return
      }

      if (result.user) {
        navigate(getHomePathForRole(result.user.role), { replace: true })
      }
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
          Get started
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your role and set up access in under a minute.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: 'customer' as const, label: 'Customer', icon: UserRound },
                  { value: 'restaurant' as const, label: 'Restaurant', icon: Store },
                ] as const
              ).map((option) => {
                const Icon = option.icon
                const selected = field.value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border p-4 text-left transition',
                      selected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-surface hover:bg-muted',
                    )}
                  >
                    <Icon
                      className={cn('size-5', selected ? 'text-primary' : 'text-muted-foreground')}
                    />
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        />
        {errors.role ? (
          <p className="text-xs text-danger" role="alert">
            {errors.role.message}
          </p>
        ) : null}

        <FormField label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            hasError={Boolean(errors.fullName)}
            placeholder="Alex Morgan"
            {...register('fullName')}
          />
        </FormField>

        <AnimatePresence initial={false}>
          {role === 'restaurant' ? (
            <motion.div
              key="restaurantName"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <FormField
                label="Restaurant name"
                htmlFor="restaurantName"
                error={errors.restaurantName?.message}
              >
                <Input
                  id="restaurantName"
                  hasError={Boolean(errors.restaurantName)}
                  placeholder="Harbor Grill"
                  {...register('restaurantName')}
                />
              </FormField>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            hasError={Boolean(errors.email)}
            placeholder="you@restaurant.com"
            {...register('email')}
          />
        </FormField>

        <FormField
          label="Password"
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

        <Button type="submit" className="w-full bg-brand-gradient border-0" loading={submitting}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={PATHS.auth.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
      </motion.div>
    </AuthFormPanel>
  )
}
