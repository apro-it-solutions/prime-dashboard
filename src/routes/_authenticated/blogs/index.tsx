import { createFileRoute } from '@tanstack/react-router'
import { Blogs } from '@/features/blogs'

export const Route = createFileRoute('/_authenticated/blogs/')({
  component: Blogs,
})
