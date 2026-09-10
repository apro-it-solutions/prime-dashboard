import { type Subscriber } from '@/types/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteSubscriberDialogProps = {
  subscriber: Subscriber | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (subscriber: Subscriber) => void
}

/** Confirmation dialog for deleting a newsletter subscriber. */
export function DeleteSubscriberDialog({
  subscriber,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteSubscriberDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(subscriber)}
      onOpenChange={onOpenChange}
      title={`Delete “${subscriber?.email ?? ''}”?`}
      // Worth spelling out: unsubscribing keeps the address on record as opted
      // out, while deleting forgets it entirely — so a later sign-up from the
      // same address comes back as a brand new subscriber.
      desc='This permanently removes the address from the newsletter list. To stop mailing someone while keeping a record of their opt-out, unsubscribe them instead. This action cannot be undone.'
      destructive
      confirmText='Delete'
      isLoading={isDeleting}
      handleConfirm={() => subscriber && onConfirm(subscriber)}
    />
  )
}
