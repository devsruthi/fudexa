import type { AuthError } from '@supabase/supabase-js'

export class AuthServiceError extends Error {
  readonly code: string

  constructor(message: string, code = 'auth_error') {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
  }
}

export function mapAuthError(error: AuthError | Error | unknown): AuthServiceError {
  if (error instanceof AuthServiceError) {
    return error
  }

  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : 'Something went wrong. Please try again.'

  const lower = message.toLowerCase()

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return new AuthServiceError('Invalid email or password.', 'invalid_credentials')
  }

  if (
    lower.includes('user already registered') ||
    lower.includes('already been registered') ||
    lower.includes('email address is already')
  ) {
    return new AuthServiceError('An account with this email already exists.', 'email_exists')
  }

  if (lower.includes('password') && (lower.includes('weak') || lower.includes('least'))) {
    return new AuthServiceError(
      'Password is too weak. Use at least 8 characters with mixed case and a number.',
      'weak_password',
    )
  }

  if (
    lower.includes('email not confirmed') ||
    lower.includes('email_not_confirmed') ||
    lower.includes('confirm your email')
  ) {
    return new AuthServiceError(
      'Please verify your email before signing in. Check your inbox for the confirmation link.',
      'email_not_confirmed',
    )
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return new AuthServiceError(
      'Network error. Check your connection and try again.',
      'network_error',
    )
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return new AuthServiceError(
      'Too many attempts. Please wait a moment and try again.',
      'rate_limit',
    )
  }

  if (lower.includes('same password')) {
    return new AuthServiceError(
      'New password must be different from your current password.',
      'same_password',
    )
  }

  return new AuthServiceError(message, 'auth_error')
}

export function getAuthErrorToast(error: unknown): { title: string; description: string } {
  const mapped = mapAuthError(error)

  switch (mapped.code) {
    case 'invalid_credentials':
      return { title: 'Invalid credentials', description: mapped.message }
    case 'email_exists':
      return { title: 'Email already exists', description: mapped.message }
    case 'weak_password':
      return { title: 'Weak password', description: mapped.message }
    case 'email_not_confirmed':
      return { title: 'Email verification required', description: mapped.message }
    case 'network_error':
      return { title: 'Network error', description: mapped.message }
    default:
      return { title: 'Authentication error', description: mapped.message }
  }
}
