import { type PaginationMeta } from '@/types/api'
import { ListPagination } from '@/components/list-pagination'

type ProjectPaginationProps = {
  meta?: PaginationMeta
  page: number
  onPageChange: (page: number) => void
}

/** Pagination bar for the project list (thin wrapper over the shared component). */
export function ProjectPagination({
  meta,
  page,
  onPageChange,
}: ProjectPaginationProps) {
  return <ListPagination meta={meta} page={page} onPageChange={onPageChange} />
}
