import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { type Testimonial, type ListQuery } from '@/types/api'
import {
  useTestimonials,
  useDeleteTestimonial,
  useToggleTestimonialStatus,
} from '@/hooks/use-testimonials'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DeleteTestimonialDialog } from '@/components/dashboard/testimonials/delete-testimonial-dialog'
import {
  SORT_PARAM,
  STATUS_ALL,
  TestimonialFilters,
  type TestimonialSort,
} from '@/components/dashboard/testimonials/testimonial-filters'
import { TestimonialPagination } from '@/components/dashboard/testimonials/testimonial-pagination'
import { TestimonialRating } from '@/components/dashboard/testimonials/testimonial-rating'
import { TestimonialSearch } from '@/components/dashboard/testimonials/testimonial-search'
import { TestimonialStatusBadge } from '@/components/dashboard/testimonials/testimonial-status-badge'
import { TestimonialTable } from '@/components/dashboard/testimonials/testimonial-table'
import { resolveImageUrl } from '@/lib/image-url'

const PAGE_SIZE = 10

export function Testimonials() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(STATUS_ALL)
  const [sort, setSort] = useState<TestimonialSort>('latest')

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    sort: SORT_PARAM[sort],
    ...(search ? { search } : {}),
    // The API filters on ?isActive=true|false rather than a status enum.
    ...(status !== STATUS_ALL
      ? { isActive: status === 'active' ? ('true' as const) : ('false' as const) }
      : {}),
  }

  const { data, isLoading, isError, refetch } = useTestimonials(params)
  const deleteMutation = useDeleteTestimonial()
  const toggleMutation = useToggleTestimonialStatus()

  const [viewing, setViewing] = useState<Testimonial | null>(null)
  const [deleting, setDeleting] = useState<Testimonial | null>(null)

  const testimonials = data?.items ?? []

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
            <h1 className='text-2xl font-bold tracking-tight'>Testimonials</h1>
            <p className='text-muted-foreground'>
              Manage your customer testimonials.
            </p>
          </div>
          <Button asChild>
            <Link to='/testimonials/create'>
              <Plus /> Add Testimonial
            </Link>
          </Button>
        </div>

        <div className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
          <TestimonialSearch
            onChange={(value) => {
              setSearch(value)
              resetPage()
            }}
          />
          <TestimonialFilters
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

        <TestimonialTable
          testimonials={testimonials}
          isLoading={isLoading}
          isError={isError}
          togglingId={
            toggleMutation.isPending ? toggleMutation.variables?.id : undefined
          }
          onRetry={() => refetch()}
          onView={setViewing}
          onEdit={(testimonial) =>
            navigate({
              to: '/testimonials/$id/edit',
              params: { id: testimonial._id },
            })
          }
          onToggleStatus={(testimonial) =>
            toggleMutation.mutate({
              id: testimonial._id,
              isActive: !testimonial.isActive,
            })
          }
          onDelete={setDeleting}
        />

        <TestimonialPagination
          meta={data?.meta}
          page={page}
          onPageChange={setPage}
        />
      </Main>

      {/* Read-only preview */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              {viewing?.designation}
              {viewing?.createdAt
                ? ` · ${format(new Date(viewing.createdAt), 'PP')}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-12'>
                  <AvatarImage
                    src={resolveImageUrl(viewing.avatar)}
                    alt={viewing.name}
                    className='object-cover'
                  />
                  <AvatarFallback>
                    {viewing.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-wrap items-center gap-2'>
                  <TestimonialStatusBadge isActive={viewing.isActive} />
                  <TestimonialRating value={viewing.rating} />
                </div>
              </div>
              <p className='text-sm whitespace-pre-line'>{viewing.review}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (
              <Button
                onClick={() =>
                  navigate({
                    to: '/testimonials/$id/edit',
                    params: { id: viewing._id },
                  })
                }
              >
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteTestimonialDialog
        testimonial={deleting}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(testimonial) =>
          deleteMutation.mutate(testimonial._id, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
