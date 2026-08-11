import { type PaginationMeta } from '@/types/api'
import { ListPagination } from '@/components/list-pagination'

type BlogPaginationProps = {
  meta?: PaginationMeta
  page: number
  onPageChange: (page: number) => void
}

/** Pagination bar for the blog list (thin wrapper over the shared component). */
export function BlogPagination({ meta, page, onPageChange }: BlogPaginationProps) {
  return <ListPagination meta={meta} page={page} onPageChange={onPageChange} />
}
