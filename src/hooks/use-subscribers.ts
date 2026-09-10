import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { subscriptionService } from '@/services/subscription.service'
import { getApiErrorMessage } from '@/lib/api-client'
import {
  type ListQuery,
  type Paginated,
  type Subscriber,
  type SubscriberStatus,
} from '@/types/api'

export const subscriberKeys = {
  all: ['subscribers'] as const,
  list: (params: ListQuery) => ['subscribers', 'list', params] as const,
}

/** GET /subscriptions */
export function useSubscribers(params: ListQuery = {}) {
  return useQuery({
    queryKey: subscriberKeys.list(params),
    queryFn: () => subscriptionService.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * PATCH /subscriptions/:id — subscribe/unsubscribe toggle.
 *
 * Applied optimistically for the same reason as the testimonial toggle: the
 * status is flipped straight from the list, and waiting for the round-trip
 * makes the button feel unresponsive. The previous cache is restored on failure.
 */
export function useToggleSubscriberStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubscriberStatus }) =>
      subscriptionService.setStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: subscriberKeys.all })
      const previous = queryClient.getQueriesData<Paginated<Subscriber>>({
        queryKey: subscriberKeys.all,
      })

      queryClient.setQueriesData<Paginated<Subscriber>>(
        { queryKey: subscriberKeys.all },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((item) =>
                  item._id === id ? { ...item, status } : item
                ),
              }
            : old
      )

      return { previous }
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data)
      )
      toast.error(getApiErrorMessage(error))
    },

    onSuccess: (subscriber) =>
      toast.success(
        subscriber.status === 'subscribed'
          ? 'Subscriber resubscribed'
          : 'Subscriber unsubscribed'
      ),

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: subscriberKeys.all })
    },
  })
}

/** DELETE /subscriptions/:id */
export function useDeleteSubscriber() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => subscriptionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriberKeys.all })
      toast.success('Subscriber deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
