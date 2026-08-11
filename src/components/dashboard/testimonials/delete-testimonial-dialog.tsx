import { type Testimonial } from '@/types/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteTestimonialDialogProps = {
  testimonial: Testimonial | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (testimonial: Testimonial) => void
}

/** Confirmation dialog for deleting a testimonial. */
export function DeleteTestimonialDialog({
  testimonial,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteTestimonialDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(testimonial)}
      onOpenChange={onOpenChange}
      title={`Delete “${testimonial?.name ?? ''}”?`}
      desc='This permanently removes the testimonial. This action cannot be undone.'
      destructive
      confirmText='Delete'
      isLoading={isDeleting}
      handleConfirm={() => testimonial && onConfirm(testimonial)}
    />
  )
}
