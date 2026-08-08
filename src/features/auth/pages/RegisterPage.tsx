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
        <p className="text-sm font-semibold text-[#FF6A00]">Get started! ✨</p>
        <h1 className="font-display text-[1.85rem] font-semibold tracking-tight text-foreground sm:text-[2.05rem]">
          Create your account
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
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  {
                    value: 'customer' as const,
                    label: 'Customer',
                    hint: 'Order & track',
                    icon: UserRound,
                  },
                  {
                    value: 'restaurant' as const,
                    label: 'Restaurant',
                    hint: 'Run the floor',
                    icon: Store,
                  },
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
                      'flex h-12 items-center gap-2.5 rounded-full border px-3.5 text-left transition',
                      selected
                        ? 'border-primary bg-primary/8 shadow-[0_0_0_3px_rgb(230_57_70_/_0.12)]'
                        : 'border-border/80 bg-muted/40 hover:border-primary/30 hover:bg-muted/70',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
                        selected
                          ? 'bg-brand-gradient text-primary-foreground'
                          : 'bg-surface text-muted-foreground',
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-tight text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-[11px] leading-tight text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
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
            placeholder=""
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
                  placeholder=""
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
            placeholder=""
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
            placeholder=""
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
            placeholder=""
            {...register('confirmPassword')}
          />
        </FormField>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl border-0 bg-[linear-gradient(90deg,_#FF7A00_0%,_#E63946_100%)] text-base text-white shadow-[0_12px_28px_-10px_rgb(230_57_70_/_0.55)]"
          loading={submitting}
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={PATHS.auth.login} className="font-semibold text-[#FF6A00] hover:text-primary">
          Sign in
        </Link>
      </p>
      </motion.div>
    </AuthFormPanel>
  )
}
