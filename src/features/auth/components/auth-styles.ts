import { cn } from '@/lib/utils'

/**
 * Shared visual tokens for the Prime NMS authentication screens
 * (Figma: prime-NMS — Sign In `800:553`, Create account `809:535`).
 *
 * Both screens use one design language: a translucent glass card on a
 * soft-light photographic backdrop. The palette is pinned rather than
 * theme-driven because the backdrop is a near-white photo — a dark-mode
 * surface would be unreadable on it.
 */
export const AUTH_COLORS = {
  heading: '#1a1d24',
  muted: '#5b616e',
  placeholder: '#9aa0ac',
  divider: '#868c98',
  danger: '#d92d20',
  googleBlue: '#4285f4',
  buttonBg: '#17191f',
} as const

export const AUTH_LABEL_CLASS =
  'text-[12.5px] leading-none font-medium text-[#5b616e] data-[error=true]:text-[#d92d20]'

/** Matches the Figma `Input` node: 46px tall, 12px radius, translucent white. */
export const AUTH_INPUT_CLASS = cn(
  'h-[46px] w-full rounded-[12px] border-[rgba(17,24,39,0.08)] bg-[rgba(255,255,255,0.55)]',
  'ps-[15px] pe-[12px] text-[14px] text-[#1a1d24] shadow-none',
  'placeholder:text-[#9aa0ac] dark:bg-[rgba(255,255,255,0.55)]',
  'focus-visible:border-[rgba(17,24,39,0.28)] focus-visible:ring-[3px] focus-visible:ring-[rgba(17,24,39,0.08)]',
  'aria-invalid:border-[#d92d20] aria-invalid:ring-[#d92d20]/15'
)

export const AUTH_MESSAGE_CLASS = 'text-[12px] font-medium text-[#d92d20]'

/** Vertical rhythm between fields inside the card's form. */
export const AUTH_FORM_GAP = 'gap-[14px]'

/** Label-to-input gap inside a single field. */
export const AUTH_FIELD_GAP = 'gap-[7px]'
