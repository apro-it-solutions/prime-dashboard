import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_RATING = 5

type TestimonialRatingProps = {
  value: number
  className?: string
}

/** Five-star rating display for a testimonial (read-only). */
export function TestimonialRating({ value, className }: TestimonialRatingProps) {
  const rounded = Math.round(value)

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      title={`${value} out of ${MAX_RATING}`}
      aria-label={`Rating: ${value} out of ${MAX_RATING}`}
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          className={cn(
            'size-3.5 shrink-0',
            index < rounded
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/40'
          )}
        />
      ))}
    </div>
  )
}
