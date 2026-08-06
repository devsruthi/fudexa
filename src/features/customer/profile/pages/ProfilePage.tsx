import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera } from 'lucide-react'
import { Button, FormField, Input, Spinner } from '@/components/ui'
import {
  AddressCard,
  EmptyState,
  ErrorState,
  FavoriteRestaurantRow,
  ProfileCard,
} from '@/features/customer/components'
import {
  useFavorites,
  useProfile,
  useToggleFavorite,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/customer/hooks'
import { useAuth } from '@/features/auth'
import { useAddressStore } from '@/store'
import { addressSchema, profileSchema, type AddressSchema, type ProfileSchema } from '@/features/customer/utils/schemas'

export function ProfilePage() {
  const { user } = useAuth()
  const profile = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const favorites = useFavorites()
  const toggleFavorite = useToggleFavorite()
  const fileRef = useRef<HTMLInputElement>(null)

  const addresses = useAddressStore((s) => (user ? s.getAddresses(user.id) : []))
  const addAddress = useAddressStore((s) => s.addAddress)
  const removeAddress = useAddressStore((s) => s.removeAddress)
  const setDefault = useAddressStore((s) => s.setDefault)

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  })

  const addressForm = useForm<AddressSchema>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', address: '' },
  })

  useEffect(() => {
    if (profile.data) {
      profileForm.reset({
        fullName: profile.data.full_name,
        phone: profile.data.phone ?? '',
      })
    }
  }, [profile.data, profileForm])

  if (profile.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading profile…" />
      </div>
    )
  }

  if (profile.isError || !profile.data) {
    return <ErrorState onRetry={() => void profile.refetch()} />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your details, addresses, and favorite restaurants.
        </p>
      </div>

      <div className="relative">
        <ProfileCard profile={profile.data} />
        <div className="absolute right-4 top-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) uploadAvatar.mutate(file)
            }}
          />
          <Button
            size="sm"
            variant="outline"
            loading={uploadAvatar.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="size-4" />
            Avatar
          </Button>
        </div>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <h2 className="font-display text-lg font-semibold text-foreground">Account details</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={profileForm.handleSubmit(async (values) => {
            await updateProfile.mutateAsync({
              fullName: values.fullName,
              phone: values.phone || null,
              avatarUrl: profile.data?.avatar_url,
            })
          })}
          noValidate
        >
          <FormField
            label="Full name"
            htmlFor="fullName"
            error={profileForm.formState.errors.fullName?.message}
          >
            <Input
              id="fullName"
              hasError={Boolean(profileForm.formState.errors.fullName)}
              {...profileForm.register('fullName')}
            />
          </FormField>
          <FormField
            label="Phone"
            htmlFor="phone"
            error={profileForm.formState.errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              hasError={Boolean(profileForm.formState.errors.phone)}
              {...profileForm.register('phone')}
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <Input id="email" value={profile.data.email} disabled />
          </FormField>
          <div className="flex items-end">
            <Button type="submit" loading={updateProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Saved addresses</h2>
        {addresses.length === 0 ? (
          <EmptyState
            title="No saved addresses"
            description="Add an address for faster checkout."
            className="py-10"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onRemove={() => user && removeAddress(user.id, address.id)}
                onSetDefault={() => user && setDefault(user.id, address.id)}
              />
            ))}
          </div>
        )}

        <form
          className="grid gap-3 rounded-[var(--radius-xl)] border border-dashed border-border p-4 sm:grid-cols-[1fr_2fr_auto]"
          onSubmit={addressForm.handleSubmit((values) => {
            if (!user) return
            addAddress(user.id, values)
            addressForm.reset()
          })}
          noValidate
        >
          <FormField
            label="Label"
            htmlFor="label"
            error={addressForm.formState.errors.label?.message}
          >
            <Input id="label" placeholder="Home" {...addressForm.register('label')} />
          </FormField>
          <FormField
            label="Address"
            htmlFor="address"
            error={addressForm.formState.errors.address?.message}
          >
            <Input
              id="address"
              placeholder="123 Market St, Apt 4"
              {...addressForm.register('address')}
            />
          </FormField>
          <div className="flex items-end">
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Favorite restaurants</h2>
        {favorites.isLoading ? (
          <Spinner label="Loading favorites…" />
        ) : (favorites.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No favorites"
            description="Save restaurants from the browse page."
            className="py-10"
          />
        ) : (
          <div className="space-y-3">
            {favorites.data?.map((restaurant) => (
              <FavoriteRestaurantRow
                key={restaurant.id}
                restaurant={restaurant}
                onRemove={() =>
                  toggleFavorite.mutate({ restaurantId: restaurant.id, isFavorite: true })
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
