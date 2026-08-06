import { z } from 'zod'

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  category_id: z.string().uuid('Select a category'),
  price: z.number().min(0, 'Price must be 0 or more'),
  preparation_time: z.number().int().min(0).nullable(),
  calories: z.number().int().min(0).nullable(),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  tags: z.string().optional(),
  stock: z.number().int().min(0),
  low_stock_limit: z.number().int().min(0),
  image: z.string().nullable().optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const reviewReplySchema = z.object({
  reply: z.string().trim().min(3, 'Reply is too short').max(500),
})

export type ReviewReplyFormValues = z.infer<typeof reviewReplySchema>

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  postal_code: z.string().trim().max(20).optional().or(z.literal('')),
  opening_time: z.string().optional().or(z.literal('')),
  closing_time: z.string().optional().or(z.literal('')),
  is_open: z.boolean(),
  tax_percentage: z.number().min(0).max(100),
  default_delivery_fee: z.number().min(0),
  minimum_order: z.number().min(0),
  delivery_radius_km: z.number().min(0).nullable(),
  accepted_payment_methods: z.array(z.enum(['Cash', 'Card', 'UPI'])).min(1),
  logo: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
