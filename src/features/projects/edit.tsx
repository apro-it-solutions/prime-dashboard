import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useProjectCategories } from '@/hooks/use-project-categories'
import { useProject, useUpdateProject } from '@/hooks/use-projects'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProjectForm } from '@/components/dashboard/projects/project-form'
import { projectToForm } from '@/components/dashboard/projects/project-form-schema'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type ProjectEditProps = { id: string }

export function ProjectEdit({ id }: ProjectEditProps) {
  const navigate = useNavigate()
  const { data: project, isLoading, isError, refetch } = useProject(id)
  const updateMutation = useUpdateProject()
  const { data: categoriesData } = useProjectCategories({ limit: 100 })
  const categories = categoriesData?.items ?? []

  const goBack = () => navigate({ to: '/projects' })

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
            <h1 className='text-2xl font-bold tracking-tight'>Edit Project</h1>
            <p className='text-muted-foreground'>Update this project.</p>
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
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-40 w-full' />
            </div>
          </div>
        ) : isError || !project ? (
          <div className='flex flex-col items-center gap-3 rounded-md border py-16 text-muted-foreground'>
            <span>Failed to load this project.</span>
            <Button variant='outline' onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <ProjectForm
            mode='edit'
            defaultValues={projectToForm(project)}
            categories={categories}
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
