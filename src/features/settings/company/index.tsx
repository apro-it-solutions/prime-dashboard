import { ContentSection } from '../components/content-section'
import { CompanyForm } from './company-form'

export function SettingsCompany() {
  return (
    <ContentSection
      title='Company'
      desc='Manage your company profile, branding, contact details and default SEO.'
    >
      <CompanyForm />
    </ContentSection>
  )
}
