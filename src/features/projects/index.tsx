import { useState } from 'react'
import { format } from 'date-fns'
import { Link, useNavigate } from '@tanstack/react-router'
import { type ListQuery, type Project } from '@/types/api'
import { ExternalLink, FolderTree, Plus } from 'lucide-react'
import { useProjectCategories } from '@/hooks/use-project-categories'
import { useDeleteProject, useProjects } from '@/hooks/use-projects'
import { Badge } from '@/components/ui/badge'
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
import { DeleteProjectDialog } from '@/components/dashboard/projects/delete-project-dialog'
import {
  CATEGORY_ALL,
  FEATURED_ALL,
  ProjectFilters,
  STATUS_ALL,
  type ProjectSort,
} from '@/components/dashboard/projects/project-filters'
import { ProjectPagination } from '@/components/dashboard/projects/project-pagination'
import { ProjectSearch } from '@/components/dashboard/projects/project-search'
import { ProjectStatusBadge } from '@/components/dashboard/projects/project-status-badge'
import { ProjectTable } from '@/components/dashboard/projects/project-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { resolveImageUrl } from '@/lib/image-url'

const PAGE_SIZE = 10

/** UI sort preset -> backend `?sort=` value. */
const SORT_PARAM: Record<ProjectSort, string> = {
  order: 'sortOrder,-createdAt',
  latest: '-createdAt',
  oldest: 'createdAt',
  title: 'title',
}

const categoryName = (category: Project['category']) =>
  category && typeof category === 'object' ? category.name : '—'

export function Projects() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(STATUS_ALL)
  const [category, setCategory] = useState<string>(CATEGORY_ALL)
  const [featured, setFeatured] = useState<string>(FEATURED_ALL)
  const [sort, setSort] = useState<ProjectSort>('order')

  // Every filter is sent to the backend; nothing is filtered client-side.
  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    sort: SORT_PARAM[sort],
    ...(search ? { search } : {}),
    ...(status !== STATUS_ALL ? { status } : {}),
    ...(category !== CATEGORY_ALL ? { category } : {}),
    ...(featured !== FEATURED_ALL
      ? { featured: featured as 'true' | 'false' }
      : {}),
  }

  const { data, isLoading, isError, refetch } = useProjects(params)
  const { data: categoriesData } = useProjectCategories({ limit: 100 })
  const deleteMutation = useDeleteProject()

  const [viewing, setViewing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)

  const projects = data?.items ?? []
  const categories = categoriesData?.items ?? []

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
            <h1 className='text-2xl font-bold tracking-tight'>Projects</h1>
            <p className='text-muted-foreground'>
              Manage the projects shown on your website.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' asChild>
              <Link to='/projects/categories'>
                <FolderTree /> Categories
              </Link>
            </Button>
            <Button asChild>
              <Link to='/projects/create'>
                <Plus /> Add Project
              </Link>
            </Button>
          </div>
        </div>

        <div className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
          <ProjectSearch
            onChange={(value) => {
              setSearch(value)
              resetPage()
            }}
          />
          <ProjectFilters
            categories={categories}
            status={status}
            category={category}
            featured={featured}
            sort={sort}
            onStatusChange={(value) => {
              setStatus(value)
              resetPage()
            }}
            onCategoryChange={(value) => {
              setCategory(value)
              resetPage()
            }}
            onFeaturedChange={(value) => {
              setFeatured(value)
              resetPage()
            }}
            onSortChange={(value) => {
              setSort(value)
              resetPage()
            }}
          />
        </div>

        <ProjectTable
          projects={projects}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onView={setViewing}
          onEdit={(project) =>
            navigate({ to: '/projects/$id/edit', params: { id: project._id } })
          }
          onDelete={setDeleting}
        />

        <ProjectPagination
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
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing ? categoryName(viewing.category) : ''}
              {viewing?.client ? ` · ${viewing.client}` : ''}
              {viewing?.location ? ` · ${viewing.location}` : ''}
              {viewing?.completionDate
                ? ` · ${format(new Date(viewing.completionDate), 'PP')}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className='space-y-4'>
              {viewing.featuredImage && (
                <img
                  src={resolveImageUrl(viewing.featuredImage)}
                  alt={viewing.title}
                  className='h-48 w-full rounded-md border object-cover'
                />
              )}
              <div className='flex flex-wrap gap-2'>
                <ProjectStatusBadge status={viewing.status} />
                {viewing.featured && <Badge variant='outline'>Featured</Badge>}
                {(viewing.technologies ?? []).map((tech) => (
                  <Badge key={tech} variant='outline'>
                    {tech}
                  </Badge>
                ))}
              </div>
              {viewing.shortDescription && (
                <p className='text-sm text-muted-foreground'>
                  {viewing.shortDescription}
                </p>
              )}
              {viewing.description && (
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{ __html: viewing.description }}
                />
              )}
              {(viewing.gallery ?? []).length > 0 && (
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                  {viewing.gallery.map((url) => (
                    <img
                      key={url}
                      src={resolveImageUrl(url)}
                      alt=''
                      className='aspect-square w-full rounded-md border object-cover'
                    />
                  ))}
                </div>
              )}
              {viewing.projectUrl && (
                <a
                  href={viewing.projectUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1 text-sm underline underline-offset-4'
                >
                  Visit project <ExternalLink className='size-3.5' />
                </a>
              )}
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
                    to: '/projects/$id/edit',
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

      <DeleteProjectDialog
        project={deleting}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(project) =>
          deleteMutation.mutate(project._id, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
