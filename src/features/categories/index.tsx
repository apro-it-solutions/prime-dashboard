import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/use-categories'
import { type Category, type ListQuery } from '@/types/api'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SearchInput } from '@/components/search-input'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'inactive']),
})

type CategoryForm = z.infer<typeof categorySchema>

const PAGE_SIZE = 10

export function Categories() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
  }

  const { data, isLoading, isError, refetch } = useCategories(params)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', status: 'active' },
  })

  const openCreate = () => {
    setEditing(null)
    form.reset({ name: '', description: '', status: 'active' })
    setDialogOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    form.reset({
      name: category.name,
      description: category.description ?? '',
      status: category.status,
    })
    setDialogOpen(true)
  }

  const onSubmit = (values: CategoryForm) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing._id, input: values },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createMutation.mutate(values, { onSuccess: () => setDialogOpen(false) })
    }
  }

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const categories = data?.items ?? []
  const isSaving = createMutation.isPending || updateMutation.isPending

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
              Product Categories
            </h1>
            <p className='text-muted-foreground'>
              Used by products only — blog and project categories are managed
              inside their own sections.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Add Category
          </Button>
        </div>

        <div className='mb-4'>
          <SearchInput onChange={onSearch} placeholder='Search product categories…' />
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-center'>Products</TableHead>
                <TableHead className='w-24 text-end'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DataLoading colSpan={5} />
              ) : isError ? (
                <DataError colSpan={5} onRetry={() => refetch()} />
              ) : categories.length === 0 ? (
                <EmptyRow colSpan={5} label='No product categories found.' />
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className='font-medium'>{category.name}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          category.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant='outline'>{category.productCount ?? 0}</Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => openEdit(category)}
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setDeleting(category)}
                        >
                          <Trash2 className='size-4 text-destructive' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Main>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit' : 'Add'} Product Category
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the product category details.'
                : 'Create a new product category.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='category-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. Electronics' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='active'>Active</SelectItem>
                        <SelectItem value='inactive'>Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDialogOpen(false)}
              type='button'
            >
              Cancel
            </Button>
            <Button type='submit' form='category-form' disabled={isSaving}>
              {isSaving && <Loader2 className='animate-spin' />}
              {editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name}"?`}
        desc='This action cannot be undone. Categories in use by products or blogs cannot be deleted.'
        destructive
        confirmText='Delete'
        isLoading={deleteMutation.isPending}
        handleConfirm={() => {
          if (!deleting) return
          deleteMutation.mutate(deleting._id, {
            onSuccess: () => setDeleting(null),
          })
        }}
      />
    </>
  )
}
