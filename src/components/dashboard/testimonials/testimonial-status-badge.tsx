import { Badge } from '@/components/ui/badge'

/** Colored status pill for a testimonial. */
export function TestimonialStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
