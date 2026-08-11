import { createFileRoute } from '@tanstack/react-router'
import { AboutCms } from '@/features/about-cms'

export const Route = createFileRoute('/_authenticated/about-cms/')({
  component: AboutCms,
})
