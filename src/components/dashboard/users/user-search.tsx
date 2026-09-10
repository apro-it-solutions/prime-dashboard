import { SearchInput } from '@/components/search-input'

type UserSearchProps = {
  onChange: (value: string) => void
  className?: string
}

/** Debounced search box for the user list (matches name or email). */
export function UserSearch({ onChange, className }: UserSearchProps) {
  return (
    <SearchInput
      onChange={onChange}
      placeholder='Search users…'
      className={className}
    />
  )
}
