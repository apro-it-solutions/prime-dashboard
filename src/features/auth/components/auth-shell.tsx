import { cn } from '@/lib/utils'
import authBackdrop from '../assets/auth-backdrop.jpg'
import lightGlow from '../assets/light-glow.svg'
import primeLogo from '../assets/prime-logo.png'

/** Artboard the Figma coordinates below are relative to. */
const ARTBOARD_WIDTH = 1920
const ARTBOARD_HEIGHT = 1080
/** The glow SVG overhangs its ellipse node by 40px on each side (blur spread). */
const GLOW_OVERHANG = 40

/**
 * Top-left of the `Light / glow` ellipse in Figma artboard pixels. Each screen
 * positions it slightly differently:
 * Create account 809:535 → 1101,115 · Sign In 800:553 → 1101,132 ·
 * Forgot password 809:571 → 1084,231.
 */
type GlowPosition = { left: number; top: number }

type AuthShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
  /** Rendered under the form. Caller supplies the whole element. */
  footer?: React.ReactNode
  glow?: GlowPosition
  className?: string
}

/**
 * Page frame shared by the Prime NMS auth screens: a glass card centred over the
 * soft-light backdrop, with the Prime mark and the screen's title block.
 *
 * Card geometry is taken from the Figma `Card` node (identical across Sign In
 * `800:553` and Create account `809:535`): 555px wide, 28px radius, 40/34/30
 * padding, 24px internal gap.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  glow = { left: 1101, top: 115 },
  className,
}: AuthShellProps) {
  const glowStyle = {
    left: `${((glow.left - GLOW_OVERHANG) / ARTBOARD_WIDTH) * 100}%`,
    top: `${((glow.top - GLOW_OVERHANG) / ARTBOARD_HEIGHT) * 100}%`,
  }

  return (
    <div className='relative flex min-h-svh w-full items-center justify-center overflow-hidden p-4 sm:p-6'>
      <img
        src={authBackdrop}
        alt=''
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 size-full object-cover'
      />

      <div
        className={cn(
          'relative flex w-full max-w-[555px] flex-col items-center gap-[20px] rounded-[22px]',
          'border border-white/90 bg-[rgba(255,255,255,0.72)] px-[22px] pt-[32px] pb-[26px]',
          'shadow-[0px_12px_24px_-8px_rgba(18,23,36,0.12),0px_40px_80px_-24px_rgba(18,23,36,0.18)]',
          'backdrop-blur-[6px] sm:gap-[24px] sm:rounded-[28px] sm:px-[34px] sm:pt-[40px] sm:pb-[30px]',
          className
        )}
      >
        <header className='flex w-full flex-col items-center gap-[16px]'>
          {/* The logo art carries a strapline below the mark; the design crops it
              out by clipping the frame to the oval. */}
          <div className='relative h-[52px] w-[134px] overflow-hidden sm:h-[58px] sm:w-[149px]'>
            <img
              src={primeLogo}
              alt='Prime'
              className='absolute start-0 top-0 h-[119.59%] w-[100.16%] max-w-none'
            />
          </div>

          <div className='flex flex-col items-center gap-[6px]'>
            <h1 className='text-[22px] font-bold text-[#1a1d24] sm:text-[24px]'>
              {title}
            </h1>
            <p className='text-center text-[13.5px] text-[#5b616e]'>
              {subtitle}
            </p>
          </div>
        </header>

        {children}

        {footer}
      </div>

      {/*
        Figma `Light / glow` — a blurred white bloom. It is the last child of the
        frame in the design, so it sits above the card and reads as light falling
        across the glass. Positioned as a percentage of the 1920x1080 artboard.
        Desktop-only: the design has no small-screen variant for it, and it is
        purely decorative.
      */}
      <img
        src={lightGlow}
        alt=''
        aria-hidden='true'
        style={glowStyle}
        className='pointer-events-none absolute hidden h-[37.96%] w-[18.44%] md:block'
      />
    </div>
  )
}
