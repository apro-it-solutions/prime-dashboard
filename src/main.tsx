import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  getApiErrorMessage,
  getErrorStatus,
  getRateLimitMessage,
  isNetworkError,
} from '@/lib/api-client'
import { shouldRetryQuery } from '@/lib/query-retry'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })
        return shouldRetryQuery(failureCount, error)
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      // A request that never reached the backend has no status to switch on.
      // Report it once (the shared toast id collapses a burst of simultaneous
      // failures into a single message) and leave the session intact — the
      // screen that owns the query decides how to recover.
      if (isNetworkError(error)) {
        toast.error('Could not reach the server. Check your connection.', {
          id: 'network-unreachable',
        })
        return
      }

      // The dashboard fans out several reads per screen, so a throttled window
      // trips many queries at once. One shared toast id keeps that to a single
      // message instead of one per query.
      if (getErrorStatus(error) === 429) {
        toast.error(getRateLimitMessage(error), { id: 'rate-limited' })
        return
      }

      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/sign-in', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
          }
        }
        // A 403 means the signed-in role may not do this. The dashboard
        // already hides what a role cannot reach, so one arriving here is
        // either a stale menu or a hand-typed URL: say so and leave the user
        // where they are rather than bouncing them off the screen. Guarded
        // routes render the 403 page themselves.
        if (error.response?.status === 403) {
          toast.error(
            getApiErrorMessage(
              error,
              'You do not have permission to do that.'
            ),
            { id: 'forbidden' }
          )
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
