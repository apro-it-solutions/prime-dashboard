import { type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import primeLogoMark from './prime-logo-mark.svg'
import primeLogo from './prime-logo.svg'

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  alt?: string
}

/**
 * The full Prime NMS lockup — oval mark with the wordmark and strapline
 * beneath it. Roughly 1.67:1, so size it by height and let the width follow.
 */
export function Logo({ className, alt = 'Prime NMS', ...props }: LogoProps) {
  return (
    <img
      src={primeLogo}
      alt={alt}
      className={cn('h-10 w-auto', className)}
      {...props}
    />
  )
}

/**
 * The oval mark on its own (strapline cropped away). Use where the lockup has
 * to sit in a small or square slot, such as the sidebar rail.
 */
export function LogoMark({
  className,
  alt = 'Prime NMS',
  ...props
}: LogoProps) {
  return (
    <img
      src={primeLogoMark}
      alt={alt}
      className={cn('h-6 w-auto', className)}
      {...props}
    />
  )
}
