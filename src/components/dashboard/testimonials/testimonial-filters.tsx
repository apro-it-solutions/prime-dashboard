import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const STATUS_ALL = 'all'
export type TestimonialSort = 'latest' | 'oldest' | 'name' | 'rating'

type TestimonialFiltersProps = {
  status: string
  sort: TestimonialSort
  onStatusChange: (value: string) => void
  onSortChange: (value: TestimonialSort) => void
}

/** Status and sort controls for the testimonial list. */
export function TestimonialFilters({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: TestimonialFiltersProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue placeholder='All statuses' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='inactive'>Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as TestimonialSort)}
      >
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='latest'>Latest first</SelectItem>
          <SelectItem value='oldest'>Oldest first</SelectItem>
          <SelectItem value='name'>Name (A–Z)</SelectItem>
          <SelectItem value='rating'>Highest rated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

/** Maps a sort option to the backend `?sort=` value. */
export const SORT_PARAM: Record<TestimonialSort, string> = {
  latest: '-createdAt',
  oldest: 'createdAt',
  name: 'name',
  rating: '-rating',
}
