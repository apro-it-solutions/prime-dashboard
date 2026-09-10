import { type ProjectCategory } from '@/types/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const STATUS_ALL = 'all'
export const CATEGORY_ALL = 'all'
export const FEATURED_ALL = 'all'

/** Sort presets exposed in the UI; mapped to backend `?sort=` values by the page. */
export type ProjectSort = 'order' | 'latest' | 'oldest' | 'title'

type ProjectFiltersProps = {
  /** Project-only categories, not the blog ones. */
  categories: ProjectCategory[]
  status: string
  category: string
  featured: string
  sort: ProjectSort
  onStatusChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onFeaturedChange: (value: string) => void
  onSortChange: (value: ProjectSort) => void
}

/** Category, status, featured and sort controls for the project list. */
export function ProjectFilters({
  categories,
  status,
  category,
  featured,
  sort,
  onStatusChange,
  onCategoryChange,
  onFeaturedChange,
  onSortChange,
}: ProjectFiltersProps) {
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

      <Select value={featured} onValueChange={onFeaturedChange}>
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue placeholder='All projects' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FEATURED_ALL}>All projects</SelectItem>
          <SelectItem value='true'>Featured only</SelectItem>
          <SelectItem value='false'>Not featured</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as ProjectSort)}
      >
        <SelectTrigger className='w-full sm:w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='order'>Sort order</SelectItem>
          <SelectItem value='latest'>Latest first</SelectItem>
          <SelectItem value='oldest'>Oldest first</SelectItem>
          <SelectItem value='title'>Title (A–Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
