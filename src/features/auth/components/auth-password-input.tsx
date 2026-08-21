import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { AUTH_INPUT_CLASS } from './auth-styles'

type AuthPasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'>

/**
 * Password field for the auth screens.
 *
 * Deliberately separate from the shared `@/components/password-input`: the Figma
 * design (809:535) specifies a 20px **open** eye in the resting/hidden state,
 * whereas the shared component shows a struck-through eye there. Changing the
 * shared one would alter the existing Sign In page.
 *
 * Geometry from the Figma `Input` node — the icon's trailing edge sits 12px in
 * from the field's right edge.
 */
export function AuthPasswordInput({
  className,
  disabled,
  ref,
  ...props
}: AuthPasswordInputProps) {
  const [visible, setVisible] = React.useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className='relative w-full'>
      <Input
        type={visible ? 'text' : 'password'}
        className={cn(AUTH_INPUT_CLASS, 'pe-[42px]', className)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      <button
        type='button'
        disabled={disabled}
        onClick={() => setVisible((prev) => !prev)}
        className={cn(
          'absolute end-[12px] top-1/2 -translate-y-1/2 rounded-[6px] text-[#5b616e]',
          'transition-colors hover:text-[#1a1d24] disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:ring-[2px] focus-visible:ring-[rgba(17,24,39,0.25)] focus-visible:outline-none'
        )}
      >
        <Icon className='size-[20px]' strokeWidth={1.75} aria-hidden='true' />
        <span className='sr-only'>
          {visible ? 'Hide password' : 'Show password'}
        </span>
      </button>
    </div>
  )
}
