import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { PageSeoCms } from './index'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  usePageSeo: vi.fn(),
  // Held as one object across renders. React Query keeps `data` referentially
  // stable while it is unchanged, and the screen's reset effect keys off that
  // identity — a fresh object per render would loop.
  data: { page: 'services', seo: {} } as {
    page: string
    seo: Record<string, unknown>
  },
}))

vi.mock('@/hooks/use-page-seo', () => ({
  usePageSeo: (page: string) => {
    mocks.usePageSeo(page)
    return {
      data: mocks.data,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  },
  useUpdatePageSeo: () => ({ mutate: mocks.mutate, isPending: false }),
}))

// Page chrome needs router / sidebar / search context this screen does not
// depend on, and ImageUpload would call the upload endpoint.
vi.mock('@/components/layout/header', () => ({
  Header: ({ children }: { children?: React.ReactNode }) => (
    <header>{children}</header>
  ),
}))
vi.mock('@/components/layout/main', () => ({
  Main: ({ children }: { children?: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))
vi.mock('@/components/search', () => ({ Search: () => null }))
vi.mock('@/components/profile-dropdown', () => ({
  ProfileDropdown: () => null,
}))
vi.mock('@/components/theme-switch', () => ({ ThemeSwitch: () => null }))
vi.mock('@/components/config-drawer', () => ({ ConfigDrawer: () => null }))
vi.mock('@/components/image-upload', () => ({ ImageUpload: () => null }))

describe('PageSeoCms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.data = { page: 'services', seo: {} }
  })

  it('shows SEO as the only tab', async () => {
    const screen = await render(<PageSeoCms page='services' />)

    await expect
      .element(screen.getByRole('tab', { name: 'SEO' }))
      .toBeInTheDocument()
    expect(screen.getByRole('tab').elements()).toHaveLength(1)
  })

  it('renders the six SEO fields plus the canonical URL', async () => {
    const screen = await render(<PageSeoCms page='contact' />)

    for (const label of [
      'Meta title',
      'Meta description',
      'Meta keywords',
      'Open Graph title',
      'Open Graph description',
      'Canonical URL',
    ]) {
      await expect.element(screen.getByLabelText(label)).toBeInTheDocument()
    }
    await expect
      .element(screen.getByText('Open Graph image'))
      .toBeInTheDocument()
  })

  it('loads the SEO stored for its own page', async () => {
    mocks.data = {
      page: 'services',
      seo: { metaTitle: 'Our Services', metaKeywords: ['steel', 'sheds'] },
    }

    const screen = await render(<PageSeoCms page='services' />)

    expect(mocks.usePageSeo).toHaveBeenCalledWith('services')
    await expect
      .element(screen.getByLabelText('Meta title'))
      .toHaveValue('Our Services')
    // Keywords are an array on the wire, a comma-separated string in the form.
    await expect
      .element(screen.getByLabelText('Meta keywords'))
      .toHaveValue('steel, sheds')
  })

  it('saves the SEO block for that page alone', async () => {
    const screen = await render(<PageSeoCms page='testimonials' />)

    await userEvent.fill(screen.getByLabelText('Meta title'), 'What clients say')
    await userEvent.fill(screen.getByLabelText('Meta keywords'), 'reviews, steel')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(mocks.mutate).toHaveBeenCalledOnce()
    const seo = mocks.mutate.mock.calls[0][0]
    expect(seo.metaTitle).toBe('What clients say')
    expect(seo.metaKeywords).toEqual(['reviews', 'steel'])
  })

  it('keeps each page on its own record', async () => {
    await render(<PageSeoCms page='blogs' />)

    expect(mocks.usePageSeo).toHaveBeenCalledWith('blogs')
    expect(mocks.usePageSeo).not.toHaveBeenCalledWith('services')
  })
})
