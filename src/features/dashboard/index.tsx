import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Newspaper, Inbox, Mail, CheckCircle2 } from 'lucide-react'
import { useDashboard } from '@/hooks/use-dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function Dashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboard()

  const counts = stats?.counts

  const cards = [
    {
      title: 'Total Blogs',
      value: counts?.totalBlogs,
      hint: `${counts?.publishedBlogs ?? 0} published`,
      icon: Newspaper,
    },
    {
      title: 'Messages',
      value: counts?.totalMessages,
      hint: `${counts?.unreadMessages ?? 0} unread`,
      icon: Inbox,
    },
  ]

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>

        {isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Unable to load dashboard</CardTitle>
              <CardDescription>
                {(error as Error)?.message ?? 'Please try again.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => refetch()}
                className='text-sm font-medium text-primary underline underline-offset-4'
              >
                Retry
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='grid gap-4 sm:grid-cols-2'>
              {cards.map((card) => (
                <Card key={card.title}>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      {card.title}
                    </CardTitle>
                    <card.icon className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className='h-8 w-16' />
                    ) : (
                      <div className='text-2xl font-bold'>{card.value ?? 0}</div>
                    )}
                    <p className='text-xs text-muted-foreground'>{card.hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Recent Blogs</CardTitle>
                  <CardDescription>Latest posts you created.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {isLoading ? (
                    <ListSkeleton />
                  ) : stats && stats.recentBlogs.length > 0 ? (
                    stats.recentBlogs.map((blog) => (
                      <div
                        key={blog._id}
                        className='flex items-center justify-between gap-4'
                      >
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            {blog.title}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {blog.createdAt
                              ? format(new Date(blog.createdAt), 'PP')
                              : '—'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            blog.status === 'published' ? 'default' : 'secondary'
                          }
                        >
                          {blog.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <EmptyState label='No blogs yet' />
                  )}
                  <Link
                    to='/blogs'
                    className='inline-block text-sm font-medium text-primary underline-offset-4 hover:underline'
                  >
                    View all blogs
                  </Link>
                </CardContent>
              </Card>

              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>
                    Latest contact form submissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {isLoading ? (
                    <ListSkeleton />
                  ) : stats && stats.recentMessages.length > 0 ? (
                    stats.recentMessages.map((msg) => (
                      <div key={msg._id} className='flex items-center gap-3'>
                        {msg.isRead ? (
                          <CheckCircle2 className='h-4 w-4 shrink-0 text-muted-foreground' />
                        ) : (
                          <Mail className='h-4 w-4 shrink-0 text-primary' />
                        )}
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-sm font-medium'>
                            {msg.name}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {msg.subject || msg.email}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState label='No messages yet' />
                  )}
                  <Link
                    to='/contact'
                    className='inline-block text-sm font-medium text-primary underline-offset-4 hover:underline'
                  >
                    Go to inbox
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </Main>
    </>
  )
}

function ListSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex items-center justify-between gap-4'>
          <div className='w-full space-y-2'>
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-3 w-1/3' />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return <p className='py-4 text-sm text-muted-foreground'>{label}</p>
}
