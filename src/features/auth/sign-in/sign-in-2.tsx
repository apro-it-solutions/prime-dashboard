import { Link } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn2() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='h-14' />
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below to log into{' '}
              <br className='max-sm:hidden' /> your account. Don't have an
              account?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Sign Up
              </Link>
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By clicking sign in, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div className='relative hidden h-full items-center justify-center overflow-hidden bg-muted lg:flex'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(40,142,73,0.12),transparent_62%)]' />
        <Logo className='relative h-40 w-auto' />
      </div>
    </div>
  )
}
