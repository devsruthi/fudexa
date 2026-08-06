import { z } from 'zod'

export const checkoutSchema = z.object({
  deliveryAddress: z
    .string()
    .trim()
    .min(5, 'Enter a full delivery address')
    .max(240, 'Address is too long'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[+0-9()\-\s]+$/, 'Enter a valid phone number'),
  notes: z.string().trim().max(300, 'Notes are too long').optional(),
  paymentMethod: z.enum(['Cash', 'Card', 'UPI'], {
    message: 'Select a payment method',
  }),
})

export type CheckoutSchema = z.infer<typeof checkoutSchema>

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long'),
  phone: z
    .string()
    .trim()
    .max(20, 'Phone number is too long')
    .regex(/^$|^[+0-9()\-\s]+$/, 'Enter a valid phone number')
    .optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(40),
  address: z.string().trim().min(5, 'Enter a full address').max(240),
})

export type AddressSchema = z.infer<typeof addressSchema>
