import { useState } from 'react'
import { type ListQuery, type Subscriber } from '@/types/api'
import {
  useDeleteSubscriber,
  useSubscribers,
  useToggleSubscriberStatus,
} from '@/hooks/use-subscribers'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DeleteSubscriberDialog } from '@/components/dashboard/subscribers/delete-subscriber-dialog'
import {
  SORT_PARAM,
  STATUS_ALL,
  SubscriberFilters,
  type SubscriberSort,
} from '@/components/dashboard/subscribers/subscriber-filters'
import { SubscriberPagination } from '@/components/dashboard/subscribers/subscriber-pagination'
import { SubscriberSearch } from '@/components/dashboard/subscribers/subscriber-search'
import { SubscriberTable } from '@/components/dashboard/subscribers/subscriber-table'

const PAGE_SIZE = 10

export function Subscribers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(STATUS_ALL)
  const [sort, setSort] = useState<SubscriberSort>('latest')

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    sort: SORT_PARAM[sort],
    ...(search ? { search } : {}),
    // 'all' is a UI-side value only; every other option is the backend's own
    // status enum and goes through unchanged.
    ...(status !== STATUS_ALL ? { status } : {}),
  }

  const { data, isLoading, isError, refetch } = useSubscribers(params)
  const toggleMutation = useToggleSubscriberStatus()
  const deleteMutation = useDeleteSubscriber()

  const [deleting, setDeleting] = useState<Subscriber | null>(null)

  const subscribers = data?.items ?? []
  // The list endpoint reports the number of subscribed addresses across the
  // whole collection alongside the page, so it survives filtering and paging.
  const activeCount = data?.meta?.active

  const resetPage = () => setPage(1)

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
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Newsletter Subscribers
            </h1>
            <p className='text-muted-foreground'>
              Addresses collected by the newsletter sign-up on the website.
              {typeof activeCount === 'number'
                ? ` ${activeCount} currently subscribed.`
                : ''}
            </p>
          </div>
        </div>

        <div className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
          <SubscriberSearch
            onChange={(value) => {
              setSearch(value)
              resetPage()
            }}
          />
          <SubscriberFilters
            status={status}
            sort={sort}
            onStatusChange={(value) => {
              setStatus(value)
              resetPage()
            }}
            onSortChange={(value) => {
              setSort(value)
              resetPage()
            }}
          />
        </div>

        <SubscriberTable
          subscribers={subscribers}
          isLoading={isLoading}
          isError={isError}
          togglingId={
            toggleMutation.isPending ? toggleMutation.variables?.id : undefined
          }
          onRetry={() => refetch()}
          onToggleStatus={(subscriber) =>
            toggleMutation.mutate({
              id: subscriber._id,
              status:
                subscriber.status === 'subscribed'
                  ? 'unsubscribed'
                  : 'subscribed',
            })
          }
          onDelete={setDeleting}
        />

        <SubscriberPagination
          meta={data?.meta}
          page={page}
          onPageChange={setPage}
        />
      </Main>

      <DeleteSubscriberDialog
        subscriber={deleting}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(subscriber) =>
          deleteMutation.mutate(subscriber._id, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
