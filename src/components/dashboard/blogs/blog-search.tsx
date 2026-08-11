import { SearchInput } from '@/components/search-input'

type BlogSearchProps = {
  onChange: (value: string) => void
  className?: string
}

/** Debounced search box for the blog list (title, excerpt, tags). */
export function BlogSearch({ onChange, className }: BlogSearchProps) {
  return (
    <SearchInput
      onChange={onChange}
      placeholder='Search blogs…'
      className={className}
    />
  )
}
