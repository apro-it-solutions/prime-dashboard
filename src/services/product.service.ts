import { apiClient } from '@/lib/api-client'
import {
  type ApiEnvelope,
  type ListQuery,
  type Paginated,
  type Product,
  type ProductInput,
} from '@/types/api'

export const productService = {
  async list(params: ListQuery = {}): Promise<Paginated<Product>> {
    const { data } = await apiClient.get<ApiEnvelope<Product[]>>('/products', {
      params,
    })
    return { items: data.data, meta: data.meta }
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get<ApiEnvelope<Product>>(`/products/${id}`)
    return data.data
  },

  async create(input: ProductInput): Promise<Product> {
    const { data } = await apiClient.post<ApiEnvelope<Product>>('/products', input)
    return data.data
  },

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data } = await apiClient.put<ApiEnvelope<Product>>(
      `/products/${id}`,
      input
    )
    return data.data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },
}
