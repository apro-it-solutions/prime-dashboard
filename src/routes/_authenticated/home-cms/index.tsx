import { createFileRoute } from '@tanstack/react-router'
import { HomeCms } from '@/features/home-cms'

export const Route = createFileRoute('/_authenticated/home-cms/')({
  component: HomeCms,
})
