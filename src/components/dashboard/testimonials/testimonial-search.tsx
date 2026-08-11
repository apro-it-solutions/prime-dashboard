import { SearchInput } from '@/components/search-input'

type TestimonialSearchProps = {
  onChange: (value: string) => void
  className?: string
}

/** Debounced search box for the testimonial list (name, company). */
export function TestimonialSearch({ onChange, className }: TestimonialSearchProps) {
  return (
    <SearchInput
      onChange={onChange}
      placeholder='Search testimonials…'
      className={className}
    />
  )
}
