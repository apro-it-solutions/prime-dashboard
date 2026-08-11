import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { productService } from '@/services/product.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type ListQuery, type ProductInput } from '@/types/api'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ListQuery) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
}

/** GET /products */
export function useProducts(params: ListQuery = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /products/:id */
export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: enabled && Boolean(id),
  })
}

/** POST /products */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => productService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PUT /products/:id */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      productService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /products/:id */
export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
