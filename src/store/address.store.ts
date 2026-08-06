import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedAddress } from '@/features/customer/types'

interface AddressState {
  addressesByUser: Record<string, SavedAddress[]>
  getAddresses: (userId: string) => SavedAddress[]
  addAddress: (userId: string, address: Omit<SavedAddress, 'id'>) => void
  removeAddress: (userId: string, addressId: string) => void
  setDefault: (userId: string, addressId: string) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addressesByUser: {},

      getAddresses: (userId) => get().addressesByUser[userId] ?? [],

      addAddress: (userId, address) => {
        const current = get().addressesByUser[userId] ?? []
        const next: SavedAddress = {
          ...address,
          id: crypto.randomUUID(),
          isDefault: current.length === 0 ? true : Boolean(address.isDefault),
        }
        const list = address.isDefault
          ? [...current.map((a) => ({ ...a, isDefault: false })), next]
          : [...current, next]
        set({
          addressesByUser: {
            ...get().addressesByUser,
            [userId]: list,
          },
        })
      },

      removeAddress: (userId, addressId) => {
        const current = get().addressesByUser[userId] ?? []
        set({
          addressesByUser: {
            ...get().addressesByUser,
            [userId]: current.filter((a) => a.id !== addressId),
          },
        })
      },

      setDefault: (userId, addressId) => {
        const current = get().addressesByUser[userId] ?? []
        set({
          addressesByUser: {
            ...get().addressesByUser,
            [userId]: current.map((a) => ({ ...a, isDefault: a.id === addressId })),
          },
        })
      },
    }),
    { name: 'orderflow-addresses' },
  ),
)
