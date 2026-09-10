import { type SubscriberStatus } from '@/types/api'
import { Badge } from '@/components/ui/badge'

/** Colored status pill for a newsletter subscriber. */
export function SubscriberStatusBadge({ status }: { status: SubscriberStatus }) {
  const isSubscribed = status === 'subscribed'
  return (
    <Badge variant={isSubscribed ? 'default' : 'secondary'}>
      {isSubscribed ? 'Subscribed' : 'Unsubscribed'}
    </Badge>
  )
}
