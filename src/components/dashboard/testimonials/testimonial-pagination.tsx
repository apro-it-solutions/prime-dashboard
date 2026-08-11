import { type PaginationMeta } from '@/types/api'
import { ListPagination } from '@/components/list-pagination'

type TestimonialPaginationProps = {
  meta?: PaginationMeta
  page: number
  onPageChange: (page: number) => void
}

/** Pagination bar for the testimonial list (thin wrapper over the shared component). */
export function TestimonialPagination({
  meta,
  page,
  onPageChange,
}: TestimonialPaginationProps) {
  return <ListPagination meta={meta} page={page} onPageChange={onPageChange} />
}
