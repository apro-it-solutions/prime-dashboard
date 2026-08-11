import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'
import { fromSeoForm, seoFormSchema, toSeoForm, emptySeoForm } from '@/lib/seo'
import { type ListQuery, type Product } from '@/types/api'
import { useCategories } from '@/hooks/use-categories'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/use-products'
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
  FormDescription,
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
import { Switch } from '@/components/ui/switch'
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
import { GalleryUpload } from '@/components/gallery-upload'
import { ImageUpload } from '@/components/image-upload'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ListPagination } from '@/components/list-pagination'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SearchInput } from '@/components/search-input'
import { SeoFields } from '@/components/seo-fields'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'

const productSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  shortDescription: z.string().max(400).optional(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Please select a category'),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  seo: seoFormSchema,
})

type ProductForm = z.infer<typeof productSchema>

const PAGE_SIZE = 10
const STATUS_ALL = 'all'

const emptyProduct: ProductForm = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  featuredImage: '',
  gallery: [],
  status: 'draft',
  featured: false,
  seo: emptySeoForm,
}

const categoryName = (category: Product['category']) =>
  category && typeof category === 'object' ? category.name : '—'
const categoryId = (category: Product['category']) =>
  category && typeof category === 'object' ? category._id : (category ?? '')

export function Products() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>(STATUS_ALL)

  const params: ListQuery = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status !== STATUS_ALL ? { status } : {}),
  }

  const { data, isLoading, isError, refetch } = useProducts(params)
  const { data: categoriesData } = useCategories({ limit: 100 })
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [viewing, setViewing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)

  const categories = categoriesData?.items ?? []
  const products = data?.items ?? []

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyProduct,
  })

  const openCreate = () => {
    setEditing(null)
    form.reset(emptyProduct)
    setDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    form.reset({
      title: product.title,
      shortDescription: product.shortDescription ?? '',
      description: product.description,
      category: categoryId(product.category),
      featuredImage: product.featuredImage ?? '',
      gallery: product.gallery ?? [],
      status: product.status,
      featured: product.featured,
      seo: toSeoForm(product.seo),
    })
    setDialogOpen(true)
  }

  const onSubmit = (values: ProductForm) => {
    const input = {
      title: values.title,
      shortDescription: values.shortDescription,
      description: values.description,
      category: values.category,
      featuredImage: values.featuredImage || undefined,
      gallery: values.gallery,
      status: values.status,
      featured: values.featured,
      seo: fromSeoForm(values.seo),
    }
    if (editing) {
      updateMutation.mutate(
        { id: editing._id, input },
        { onSuccess: () => setDialogOpen(false) }
      )
    } else {
      createMutation.mutate(input, { onSuccess: () => setDialogOpen(false) })
    }
  }

  const onSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const onStatusChange = (value: string) => {
    setStatus(value)
    setPage(1)
  }

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
            <h1 className='text-2xl font-bold tracking-tight'>Products</h1>
            <p className='text-muted-foreground'>Manage your product catalog.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Add Product
          </Button>
        </div>

        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <SearchInput
            onChange={onSearch}
            placeholder='Search products…'
          />
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='All statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
              <SelectItem value='draft'>Draft</SelectItem>
              <SelectItem value='published'>Published</SelectItem>
              <SelectItem value='archived'>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className='w-32 text-end'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <DataLoading colSpan={5} />
              ) : isError ? (
                <DataError colSpan={5} onRetry={() => refetch()} />
              ) : products.length === 0 ? (
                <EmptyRow colSpan={5} label='No products found.' />
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className='font-medium'>{product.title}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {categoryName(product.category)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === 'published'
                            ? 'default'
                            : product.status === 'archived'
                              ? 'outline'
                              : 'secondary'
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.featured ? (
                        <Badge>Featured</Badge>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-end'>
                      <div className='flex justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          title='View'
                          onClick={() => setViewing(product)}
                        >
                          <Eye className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          title='Edit'
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          title='Delete'
                          onClick={() => setDeleting(product)}
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
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Product</DialogTitle>
            <DialogDescription>
              {editing ? 'Update the product details.' : 'Create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='product-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Product title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='shortDescription'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short description</FormLabel>
                    <FormControl>
                      <Input placeholder='Brief summary' {...field} />
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
                        rows={5}
                        placeholder='Full product description'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='featuredImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='gallery'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery</FormLabel>
                    <FormControl>
                      <GalleryUpload
                        value={field.value}
                        onChange={field.onChange}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='draft'>Draft</SelectItem>
                        <SelectItem value='published'>Published</SelectItem>
                        <SelectItem value='archived'>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='featured'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        Highlight this product on the storefront.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <SeoFields />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant='outline'
              type='button'
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' form='product-form' disabled={isSaving}>
              {isSaving && <Loader2 className='animate-spin' />}
              {editing ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing ? categoryName(viewing.category) : ''}
            </DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className='space-y-4'>
              {viewing.featuredImage && (
                <img
                  src={viewing.featuredImage}
                  alt={viewing.title}
                  className='h-48 w-full rounded-md border object-cover'
                />
              )}
              <div className='flex flex-wrap gap-2'>
                <Badge
                  variant={
                    viewing.status === 'published'
                      ? 'default'
                      : viewing.status === 'archived'
                        ? 'outline'
                        : 'secondary'
                  }
                >
                  {viewing.status}
                </Badge>
                {viewing.featured && <Badge>Featured</Badge>}
              </div>
              {viewing.shortDescription && (
                <p className='text-sm text-muted-foreground'>
                  {viewing.shortDescription}
                </p>
              )}
              <p className='text-sm whitespace-pre-wrap'>
                {viewing.description}
              </p>
              {viewing.gallery && viewing.gallery.length > 0 && (
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                  {viewing.gallery.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=''
                      className='aspect-square w-full rounded-md border object-cover'
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setViewing(null)}>
              Close
            </Button>
            {viewing && (
              <Button
                onClick={() => {
                  openEdit(viewing)
                  setViewing(null)
                }}
              >
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.title}"?`}
        desc='This action cannot be undone.'
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
