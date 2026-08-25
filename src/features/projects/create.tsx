import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useProjectCategories } from '@/hooks/use-project-categories'
import { useCreateProject } from '@/hooks/use-projects'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProjectForm } from '@/components/dashboard/projects/project-form'
import { emptyProjectForm } from '@/components/dashboard/projects/project-form-schema'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

export function ProjectCreate() {
  const navigate = useNavigate()
  const createMutation = useCreateProject()
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
            <h1 className='text-2xl font-bold tracking-tight'>New Project</h1>
            <p className='text-muted-foreground'>
              Add a project to your website portfolio.
            </p>
          </div>
        </div>

        <ProjectForm
          mode='create'
          defaultValues={emptyProjectForm}
          categories={categories}
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
