import { useEffect, useState } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type SearchInputProps = {
  /** Emits the debounced query value. */
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

/** Debounced search box for list pages. */
export function SearchInput({
  onChange,
  placeholder = 'Search…',
  debounceMs = 350,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const id = setTimeout(() => onChange(value.trim()), debounceMs)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, debounceMs])

  return (
    <div className={cn('relative w-full sm:w-64', className)}>
      <SearchIcon className='absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className='ps-8 pe-8'
      />
      {value && (
        <button
          type='button'
          onClick={() => setValue('')}
          className='absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
        >
          <X className='size-4' />
        </button>
      )}
    </div>
  )
}
