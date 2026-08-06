import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/utils'

interface ImageUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  label?: string
  className?: string
  aspect?: 'square' | 'cover'
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  label = 'Upload image',
  className,
  aspect = 'square',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-[var(--radius-xl)] border border-dashed border-border bg-muted/40',
          aspect === 'cover' ? 'aspect-[16/7]' : 'aspect-square max-w-xs',
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="size-8" aria-hidden />
            <span className="text-sm">{label}</span>
          </div>
        )}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="size-6 animate-spin text-primary" aria-label="Uploading" />
          </div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Replace' : 'Choose image'}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
