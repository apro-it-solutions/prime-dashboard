import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { contactService } from '@/services/contact.service'
import { getApiErrorMessage } from '@/lib/api-client'
import { type ListQuery } from '@/types/api'

export const contactKeys = {
  all: ['contact'] as const,
  list: (params: ListQuery) => ['contact', 'list', params] as const,
  detail: (id: string) => ['contact', 'detail', id] as const,
}

/** GET /contact/messages */
export function useContactMessages(params: ListQuery = {}) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => contactService.list(params),
    placeholderData: keepPreviousData,
  })
}

/** GET /contact/messages/:id — viewing marks the message read server-side. */
export function useContactMessage(id: string, enabled = true) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: async () => {
      const message = await contactService.view(id)
      // The list unread badge/state changes when a message is read.
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      return message
    },
    enabled: enabled && Boolean(id),
  })
}

/** PATCH /contact/messages/:id/read */
export function useMarkContactRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      contactService.markRead(id, isRead),
    onSuccess: (_data, { isRead }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      toast.success(`Marked as ${isRead ? 'read' : 'unread'}`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

/** DELETE /contact/messages/:id */
export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      toast.success('Message deleted')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
