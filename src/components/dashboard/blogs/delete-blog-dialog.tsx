import { type Blog } from '@/types/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteBlogDialogProps = {
  blog: Blog | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (blog: Blog) => void
}

/** Confirmation dialog for deleting a blog post. */
export function DeleteBlogDialog({
  blog,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteBlogDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(blog)}
      onOpenChange={onOpenChange}
      title={`Delete “${blog?.title ?? ''}”?`}
      desc='This permanently removes the blog post. This action cannot be undone.'
      destructive
      confirmText='Delete'
      isLoading={isDeleting}
      handleConfirm={() => blog && onConfirm(blog)}
    />
  )
}
