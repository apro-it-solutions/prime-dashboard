import { type ContentStatus } from '@/types/api'
import { Badge } from '@/components/ui/badge'

const VARIANT: Record<ContentStatus, 'default' | 'secondary' | 'outline'> = {
  published: 'default',
  draft: 'secondary',
  archived: 'outline',
}

const LABEL: Record<ContentStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
}

/** Colored status pill for a project. */
export function ProjectStatusBadge({ status }: { status: ContentStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>
}
