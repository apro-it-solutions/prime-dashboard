import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { testimonialService } from '@/services/testimonial.service'
import { getApiErrorMessage } from '@/lib/api-client'
import {
  type ListQuery,
  type Paginated,
  type Testimonial,
  type TestimonialInput,
} from '@/types/api'

export const testimonialKeys = {
  all: ['testimonials'] as const,
  list: (params: ListQuery) => ['testimonials', 'list', params] as const,
  detail: (id: string) => ['testimonials', 'detail', id] as const,
}

/** Cached list and detail queries hold different shapes under the same root key. */
type TestimonialCache = Paginated<Testimonial> | Testimonial | undefined

const isPaginated = (value: TestimonialCache): value is Paginated<Testimonial> =>
  Boolean(value && typeof value === 'object' && 'items' in value)

/** GET /testimonials */
export function useTestimonials(params: ListQuery = {}) {
  return useQuery({
    queryKey: testimonialKeys.list(params),
    queryFn: () => testimonialService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /testimonials/:id — single testimonial, used by the edit page. */
export function useTestimonial(id: string | undefined) {
  return useQuery({
    queryKey: testimonialKeys.detail(id ?? ''),
    queryFn: () => testimonialService.getById(id as string),
    enabled: Boolean(id),
  })
}

/** POST /testimonials */
export function useCreateTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TestimonialInput) => testimonialService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
      toast.success('Testimonial created')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** PATCH /testimonials/:id */
export function useUpdateTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Partial<TestimonialInput>
    }) => testimonialService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
      toast.success('Testimonial updated')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/**
 * PATCH /testimonials/:id — activate/deactivate toggle.
 *
 * Applied optimistically because the status badge is toggled straight from the
 * list and waiting for the round-trip makes the switch feel unresponsive. The
 * previous cache is restored if the request fails.
 */
export function useToggleTestimonialStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      testimonialService.update(id, { isActive }),

    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: testimonialKeys.all })
      const previous = queryClient.getQueriesData<TestimonialCache>({
        queryKey: testimonialKeys.all,
      })

      queryClient.setQueriesData<TestimonialCache>(
        { queryKey: testimonialKeys.all },
        (old) => {
          if (isPaginated(old)) {
            return {
              ...old,
              items: old.items.map((item) =>
                item._id === id ? { ...item, isActive } : item
              ),
            }
          }
          if (old && old._id === id) return { ...old, isActive }
          return old
        }
      )

      return { previous }
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(getApiErrorMessage(error))
    },

    onSuccess: (testimonial) =>
      toast.success(
        testimonial.isActive ? 'Testimonial activated' : 'Testimonial deactivated'
      ),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
    },
  })
}

/** DELETE /testimonials/:id */
export function useDeleteTestimonial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => testimonialService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all })
      toast.success('Testimonial deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
