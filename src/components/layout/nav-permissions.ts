import { type Permission } from '@/lib/rbac'
import { type NavGroup, type NavItem } from './types'

const allowedBy = (
  held: readonly Permission[],
  required: Permission[] | undefined
): boolean => (required ?? []).every((permission) => held.includes(permission))

/**
 * Trims the navigation to what `held` allows.
 *
 * An entry with no `permissions` is visible to anyone signed in. A collapsible
 * keeps only the children the user may reach and disappears entirely once none
 * are left, and a group disappears once all of its items have. That way a role
 * never sees an empty section header or a menu that opens onto nothing.
 *
 * Hiding a link is a convenience, not a control — every route behind one is
 * guarded in its own right, and the API refuses the request regardless.
 */
export function filterNavGroups(
  groups: NavGroup[],
  held: readonly Permission[]
): NavGroup[] {
  return groups.reduce<NavGroup[]>((kept, group) => {
    const items = group.items.reduce<NavItem[]>((keptItems, item) => {
      if (!allowedBy(held, item.permissions)) return keptItems

      if (!item.items) {
        keptItems.push(item)
        return keptItems
      }

      const children = item.items.filter((child) =>
        allowedBy(held, child.permissions)
      )
      if (children.length > 0) {
        keptItems.push({ ...item, items: children })
      }
      return keptItems
    }, [])

    if (items.length > 0) {
      kept.push({ ...group, items })
    }
    return kept
  }, [])
}
