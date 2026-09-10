import { type PaginationMeta } from '@/types/api'
import { ListPagination } from '@/components/list-pagination'

type SubscriberPaginationProps = {
  meta?: PaginationMeta
  page: number
  onPageChange: (page: number) => void
}

/** Pagination bar for the subscriber list (thin wrapper over the shared component). */
export function SubscriberPagination({
  meta,
  page,
  onPageChange,
}: SubscriberPaginationProps) {
  return <ListPagination meta={meta} page={page} onPageChange={onPageChange} />
}
