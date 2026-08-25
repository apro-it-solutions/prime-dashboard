import { type Project } from '@/types/api'
import { ConfirmDialog } from '@/components/confirm-dialog'

type DeleteProjectDialogProps = {
  project: Project | null
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (project: Project) => void
}

/** Confirmation dialog for deleting a project. */
export function DeleteProjectDialog({
  project,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <ConfirmDialog
      open={Boolean(project)}
      onOpenChange={onOpenChange}
      title={`Delete “${project?.title ?? ''}”?`}
      desc='This permanently removes the project. This action cannot be undone.'
      destructive
      confirmText='Delete'
      isLoading={isDeleting}
      handleConfirm={() => project && onConfirm(project)}
    />
  )
}
