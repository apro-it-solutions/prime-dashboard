import { createFileRoute } from '@tanstack/react-router'
import { Contact } from '@/features/contact'

export const Route = createFileRoute('/_authenticated/contact/')({
  component: Contact,
})
