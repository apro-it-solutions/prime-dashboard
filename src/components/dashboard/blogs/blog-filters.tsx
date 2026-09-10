import { type BlogCategory } from '@/types/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const STATUS_ALL = 'all'
export const CATEGORY_ALL = 'all'
export type BlogSort = 'latest' | 'oldest'

type BlogFiltersProps = {
  /** Blog-only categories, not the project ones. */
  categories: BlogCategory[]
  status: string
  category: string
  sort: BlogSort
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortChange: (value: BlogSort) => void
}

/** Category, status and sort controls for the blog list. */
export function BlogFilters({
  categories,
  status,
  category,
  sort,
  onStatusChange,
  onCategoryChange,
  onSortChange,
}: BlogFiltersProps) {
  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className='w-full sm:w-44'>
          <SelectValue placeholder='All categories' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={CATEGORY_ALL}>All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c._id} value={c._id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue placeholder='All statuses' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
          <SelectItem value='draft'>Draft</SelectItem>
          <SelectItem value='published'>Published</SelectItem>
          <SelectItem value='archived'>Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as BlogSort)}
      >
        <SelectTrigger className='w-full sm:w-36'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='latest'>Latest first</SelectItem>
          <SelectItem value='oldest'>Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
