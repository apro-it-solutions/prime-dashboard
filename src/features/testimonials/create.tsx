import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useCreateTestimonial } from '@/hooks/use-testimonials'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TestimonialForm } from '@/components/dashboard/testimonials/testimonial-form'
import { emptyTestimonialForm } from '@/components/dashboard/testimonials/testimonial-form-schema'

export function TestimonialCreate() {
  const navigate = useNavigate()
  const createMutation = useCreateTestimonial()

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
              New Testimonial
            </h1>
            <p className='text-muted-foreground'>
              Add a new customer testimonial.
            </p>
          </div>
        </div>

        <TestimonialForm
          mode='create'
          defaultValues={emptyTestimonialForm}
          isSubmitting={createMutation.isPending}
          onCancel={goBack}
          onSubmit={(input) =>
            createMutation.mutate(input, { onSuccess: goBack })
          }
        />
      </Main>
    </>
  )
}
