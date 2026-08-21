import { Link, type LinkProps } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Primary action button — Figma `Button / Primary`: 48px tall, 12px radius,
 * #17191f, with the lifted shadow.
 */
export function AuthSubmitButton({
  children,
  pendingLabel,
  isPending,
  className,
}: {
  children: React.ReactNode
  /** Label shown while the request is in flight. */
  pendingLabel: string
  isPending: boolean
  className?: string
}) {
  return (
    <Button
      type='submit'
      disabled={isPending}
      className={cn(
        'h-[48px] w-full rounded-[12px] bg-[#17191f] text-[14px] font-semibold text-white',
        'shadow-[0px_8px_20px_-8px_rgba(18,23,36,0.5)] hover:bg-[#24272f] active:bg-[#0f1116]',
        'focus-visible:ring-[3px] focus-visible:ring-[rgba(17,24,39,0.25)]',
        className
      )}
    >
      {isPending && <Loader2 className='size-4 animate-spin' />}
      {isPending ? pendingLabel : children}
    </Button>
  )
}

/**
 * Figma `ForgotRow` (809:458): a 16px-tall row holding a single end-aligned
 * link, sitting between the password field and the primary button.
 */
export function AuthForgotRow({ children }: { children: React.ReactNode }) {
  return <div className='flex h-[16px] items-center justify-end'>{children}</div>
}

/** Figma `Divider`: hairline rules either side of a small uppercase label. */
export function AuthDivider({ label = 'OR' }: { label?: string }) {
  return (
    <div className='flex h-[12px] items-center gap-[14px]'>
      <span className='h-px flex-1 bg-[rgba(17,24,39,0.1)]' />
      <span className='text-[11.5px] font-medium text-[#868c98]'>{label}</span>
      <span className='h-px flex-1 bg-[rgba(17,24,39,0.1)]' />
    </div>
  )
}

/**
 * Figma `Button / Google`. Present in both auth designs, but the backend exposes
 * no OAuth provider (auth is email/password + JWT only), so it renders disabled
 * rather than pretending to work.
 */
export function AuthGoogleButton({ label }: { label: string }) {
  return (
    <Button
      type='button'
      variant='outline'
      disabled
      title='Google sign-in is not available yet'
      className={cn(
        'h-[46px] w-full gap-[10px] rounded-[12px] border-[rgba(17,24,39,0.1)]',
        'bg-[rgba(255,255,255,0.7)] text-[14px] font-medium text-[#1a1d24] shadow-none',
        'disabled:opacity-60 dark:bg-[rgba(255,255,255,0.7)]'
      )}
    >
      <span className='text-[15px] font-bold text-[#4285f4]'>G</span>
      {label}
    </Button>
  )
}

/**
 * Figma `Footer` — the centred "question + action" row used by Sign In and
 * Create account (13px, 4px gap).
 */
export function AuthFooterRow({ children }: { children: React.ReactNode }) {
  return (
    <footer className='flex flex-wrap items-center justify-center gap-x-[4px] gap-y-[2px] text-center text-[13px]'>
      {children}
    </footer>
  )
}

/**
 * Figma `Back` (809:659) — a 16px left arrow and label, 7px apart, centred.
 * Used as the Forgot password screen's footer.
 */
export function AuthBackRow({
  to,
  children,
}: {
  to: LinkProps['to']
  children: React.ReactNode
}) {
  return (
    <footer className='flex items-center justify-center'>
      <Link
        to={to}
        className='flex items-center gap-[7px] text-[13px] font-medium text-[#5b616e] transition-colors hover:text-[#1a1d24]'
      >
        <ArrowLeft className='size-[16px]' strokeWidth={1.8} aria-hidden='true' />
        {children}
      </Link>
    </footer>
  )
}

/** Form-level API/server error, shown above the submit button. */
export function AuthFormError({ message }: { message: string }) {
  return (
    <p
      role='alert'
      className='rounded-[10px] border border-[#d92d20]/20 bg-[#d92d20]/8 px-3 py-2 text-center text-[12.5px] font-medium text-[#d92d20]'
    >
      {message}
    </p>
  )
}

/**
 * Form-level success notice, same geometry as `AuthFormError`. The Figma screens
 * do not specify a success state, so this reuses their tokens rather than
 * introducing a new surface.
 */
export function AuthFormSuccess({ message }: { message: string }) {
  return (
    <p
      role='status'
      className='rounded-[10px] border border-[#0a7d54]/20 bg-[#0a7d54]/8 px-3 py-2 text-center text-[12.5px] font-medium text-[#0a7d54]'
    >
      {message}
    </p>
  )
}
