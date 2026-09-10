import { type AdminUser } from '@/types/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteUserDialogProps = {
  user: AdminUser | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (user: AdminUser) => void
}

/** Confirmation dialog for deleting an admin account. */
export function DeleteUserDialog({
  user,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(user)}
      onOpenChange={onOpenChange}
      title={`Delete “${user?.name ?? ''}”?`}
      desc={
        `${user?.email ?? 'This account'} will lose access immediately. ` +
        'This cannot be undone — deactivate the account instead if you may want it back.'
      }
      destructive
      confirmText='Delete'
      isLoading={isDeleting}
      handleConfirm={() => user && onConfirm(user)}
    />
  )
}
