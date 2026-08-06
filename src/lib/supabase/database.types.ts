export type AppRole = 'customer' | 'restaurant'

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'OutForDelivery'
  | 'Completed'
  | 'Cancelled'

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded'

export type PaymentMethod = 'Cash' | 'Card' | 'UPI'

export type InventoryStatus = 'InStock' | 'LowStock' | 'OutOfStock'

export type NotificationType = 'order' | 'system' | 'promotion' | 'review'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: AppRole
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: AppRole
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: AppRole
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          logo: string | null
          cover_image: string | null
          address: string
          city: string
          country: string
          postal_code: string | null
          phone: string | null
          email: string | null
          opening_time: string | null
          closing_time: string | null
          is_open: boolean
          rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          logo?: string | null
          cover_image?: string | null
          address: string
          city: string
          country: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          opening_time?: string | null
          closing_time?: string | null
          is_open?: boolean
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          logo?: string | null
          cover_image?: string | null
          address?: string
          city?: string
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          opening_time?: string | null
          closing_time?: string | null
          is_open?: boolean
          rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'restaurants_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
        ]
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          image: string | null
          is_available: boolean
          preparation_time: number | null
          calories: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id: string
          name: string
          description?: string | null
          price: number
          image?: string | null
          is_available?: boolean
          preparation_time?: number | null
          calories?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          is_available?: boolean
          preparation_time?: number | null
          calories?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'menu_items_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'menu_items_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          restaurant_id: string
          menu_item_id: string
          stock: number
          low_stock_limit: number
          status: InventoryStatus
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          menu_item_id: string
          stock?: number
          low_stock_limit?: number
          status?: InventoryStatus
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          menu_item_id?: string
          stock?: number
          low_stock_limit?: number
          status?: InventoryStatus
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inventory_menu_item_id_fkey'
            columns: ['menu_item_id']
            isOneToOne: true
            referencedRelation: 'menu_items'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          restaurant_id: string
          status: OrderStatus
          subtotal: number
          tax: number
          delivery_fee: number
          discount: number
          total: number
          payment_status: PaymentStatus
          payment_method: PaymentMethod
          delivery_address: string
          notes: string | null
          estimated_delivery: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          restaurant_id: string
          status?: OrderStatus
          subtotal?: number
          tax?: number
          delivery_fee?: number
          discount?: number
          total?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod
          delivery_address: string
          notes?: string | null
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          restaurant_id?: string
          status?: OrderStatus
          subtotal?: number
          tax?: number
          delivery_fee?: number
          discount?: number
          total?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod
          delivery_address?: string
          notes?: string | null
          estimated_delivery?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          price: number
          subtotal: number
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          price?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_menu_item_id_fkey'
            columns: ['menu_item_id']
            isOneToOne: false
            referencedRelation: 'menu_items'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string
          rating: number
          review: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id: string
          rating: number
          review?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string
          rating?: number
          review?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          customer_id: string
          restaurant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          restaurant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          restaurant_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: NotificationType
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: NotificationType
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      analytics_restaurant_revenue: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          restaurant_name: string | null
          completed_orders: number | null
          total_revenue: number | null
          total_subtotal: number | null
          total_tax: number | null
          total_delivery_fees: number | null
          total_discounts: number | null
        }
        Relationships: []
      }
      analytics_daily_orders: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          order_date: string | null
          order_count: number | null
          completed_count: number | null
          cancelled_count: number | null
          revenue: number | null
        }
        Relationships: []
      }
      analytics_monthly_sales: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          month_start: string | null
          completed_orders: number | null
          revenue: number | null
          average_order_value: number | null
        }
        Relationships: []
      }
      analytics_best_selling_menu_items: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          menu_item_id: string | null
          menu_item_name: string | null
          category_id: string | null
          category_name: string | null
          units_sold: number | null
          revenue: number | null
          order_count: number | null
        }
        Relationships: []
      }
      analytics_top_customers: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          customer_id: string | null
          customer_name: string | null
          customer_email: string | null
          order_count: number | null
          total_spent: number | null
          last_order_at: string | null
        }
        Relationships: []
      }
      analytics_average_order_value: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          restaurant_name: string | null
          paid_order_count: number | null
          average_order_value: number | null
          median_order_value: number | null
        }
        Relationships: []
      }
      analytics_popular_categories: {
        Row: {
          restaurant_id: string | null
          owner_id: string | null
          category_id: string | null
          category_name: string | null
          units_sold: number | null
          revenue: number | null
          order_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_role: { Args: Record<string, never>; Returns: AppRole }
      is_customer: { Args: Record<string, never>; Returns: boolean }
      is_restaurant_user: { Args: Record<string, never>; Returns: boolean }
      owns_restaurant: { Args: { p_restaurant_id: string }; Returns: boolean }
      owned_restaurant_ids: { Args: Record<string, never>; Returns: string[] }
      refresh_restaurant_rating: {
        Args: { p_restaurant_id: string }
        Returns: undefined
      }
      compute_inventory_status: {
        Args: { p_stock: number; p_low_stock_limit: number }
        Returns: InventoryStatus
      }
    }
    Enums: {
      user_role: AppRole
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      inventory_status: InventoryStatus
      notification_type: NotificationType
    }
    CompositeTypes: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Inventory = Database['public']['Tables']['inventory']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
