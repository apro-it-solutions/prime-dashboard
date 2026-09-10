import { SearchInput } from '@/components/search-input'

type SubscriberSearchProps = {
  onChange: (value: string) => void
  className?: string
}

/** Debounced search box for the subscriber list (email). */
export function SubscriberSearch({ onChange, className }: SubscriberSearchProps) {
  return (
    <SearchInput
      onChange={onChange}
      placeholder='Search by email…'
      className={className}
    />
  )
}
