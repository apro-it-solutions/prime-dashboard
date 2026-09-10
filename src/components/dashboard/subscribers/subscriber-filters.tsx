import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const STATUS_ALL = 'all'
export type SubscriberSort = 'latest' | 'oldest' | 'email'

type SubscriberFiltersProps = {
  status: string
  sort: SubscriberSort
  onStatusChange: (value: string) => void
  onSortChange: (value: SubscriberSort) => void
}

/**
 * Status and sort controls for the subscriber list.
 *
 * The two status values are the backend's own enum, so they go to the API
 * unchanged; only `all` is a UI-side value, and it simply omits the filter.
 */
export function SubscriberFilters({
  status,
  sort,
  onStatusChange,
  onSortChange,
}: SubscriberFiltersProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full sm:w-44'>
          <SelectValue placeholder='All statuses' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
          <SelectItem value='subscribed'>Subscribed</SelectItem>
          <SelectItem value='unsubscribed'>Unsubscribed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as SubscriberSort)}
      >
        <SelectTrigger className='w-full sm:w-44'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='latest'>Newest first</SelectItem>
          <SelectItem value='oldest'>Oldest first</SelectItem>
          <SelectItem value='email'>Email (A–Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

/** Maps a sort option to the backend `?sort=` value. */
export const SORT_PARAM: Record<SubscriberSort, string> = {
  latest: '-createdAt',
  oldest: 'createdAt',
  email: 'email',
}
