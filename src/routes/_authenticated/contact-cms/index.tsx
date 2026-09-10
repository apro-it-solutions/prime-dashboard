import { createFileRoute } from '@tanstack/react-router'
import { PERMISSIONS } from '@/lib/rbac'
import { guarded } from '@/lib/route-guard'
import { PageSeoCms } from '@/features/page-seo'

export const Route = createFileRoute('/_authenticated/contact-cms/')({
  component: guarded([PERMISSIONS.SEO_VIEW], RouteComponent),
})

// eslint-disable-next-line react-refresh/only-export-components
function RouteComponent() {
  return <PageSeoCms page='contact' />
}
