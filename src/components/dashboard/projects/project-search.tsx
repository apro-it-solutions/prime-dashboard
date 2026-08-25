import { SearchInput } from '@/components/search-input'

type ProjectSearchProps = {
  onChange: (value: string) => void
  className?: string
}

/** Debounced search box for the project list (title, client, location, tech). */
export function ProjectSearch({ onChange, className }: ProjectSearchProps) {
  return (
    <SearchInput
      onChange={onChange}
      placeholder='Search projects…'
      className={className}
    />
  )
}
