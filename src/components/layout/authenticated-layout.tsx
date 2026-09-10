import { Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useMe } from '@/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/api-client'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'

  // Automatically hydrate the signed-in admin from GET /auth/me on load.
  // A failed/expired token is handled by the axios + query-cache interceptors,
  // which reset the session and redirect to /sign-in.
  const { isLoading, isError, error, refetch, isFetching } = useMe()

  if (isLoading) {
    return (
      <div className='flex h-svh w-full items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-muted-foreground' />
      </div>
    )
  }

  // An unreachable backend used to fall into the spinner above and stay there
  // forever, which read as the whole dashboard being broken. A 401 still tears
  // the session down and redirects (see the query cache in main.tsx), so what
  // lands here is a transport failure the admin can retry without signing out.
  if (isError) {
    return (
      <div className='flex h-svh w-full flex-col items-center justify-center gap-4 p-6 text-center'>
        <div className='space-y-1.5'>
          <p className='text-lg font-medium'>Can't reach the server</p>
          <p className='max-w-sm text-sm text-muted-foreground'>
            {getApiErrorMessage(
              error,
              'The dashboard could not verify your session.'
            )}
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching && <Loader2 className='size-4 animate-spin' />}
          Try again
        </Button>
      </div>
    )
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',

              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-data-[layout=fixed]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
