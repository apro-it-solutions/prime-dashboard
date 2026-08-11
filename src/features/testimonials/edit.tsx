import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTestimonial, useUpdateTestimonial } from '@/hooks/use-testimonials'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TestimonialForm } from '@/components/dashboard/testimonials/testimonial-form'
import { testimonialToForm } from '@/components/dashboard/testimonials/testimonial-form-schema'

type TestimonialEditProps = { id: string }

export function TestimonialEdit({ id }: TestimonialEditProps) {
  const navigate = useNavigate()
  const { data: testimonial, isLoading, isError, refetch } = useTestimonial(id)
  const updateMutation = useUpdateTestimonial()

  const goBack = () => navigate({ to: '/testimonials' })

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
        <div className='mb-6 flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={goBack} title='Back'>
            <ArrowLeft className='size-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Edit Testimonial
            </h1>
            <p className='text-muted-foreground'>Update this testimonial.</p>
          </div>
        </div>

        {isLoading ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-64 w-full' />
            </div>
            <div className='space-y-6'>
              <Skeleton className='h-40 w-full' />
              <Skeleton className='h-40 w-full' />
            </div>
          </div>
        ) : isError || !testimonial ? (
          <div className='flex flex-col items-center gap-3 rounded-md border py-16 text-muted-foreground'>
            <span>Failed to load this testimonial.</span>
            <Button variant='outline' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <TestimonialForm
            mode='edit'
            defaultValues={testimonialToForm(testimonial)}
            isSubmitting={updateMutation.isPending}
            onCancel={goBack}
            onSubmit={(input) =>
              updateMutation.mutate({ id, input }, { onSuccess: goBack })
            }
          />
        )}
      </Main>
    </>
  )
}
