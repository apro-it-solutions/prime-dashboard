import { format } from 'date-fns'
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import { normalizeRole } from '@/lib/rbac'
import { type AdminUser } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataError, DataLoading, EmptyRow } from '@/features/shared/data-states'
import { UserRoleBadge } from './user-role-badge'
import { UserStatusBadge } from './user-status-badge'

const COL_SPAN = 6

const fmtDate = (value?: string): string =>
  value ? format(new Date(value), 'PP') : '—'

type UserTableProps = {
  users: AdminUser[]
  isLoading: boolean
  isError: boolean
  /** The signed-in admin's id, so their own row can be labelled and protected. */
  currentUserId?: string
  togglingId?: string
  onRetry: () => void
  onEdit: (user: AdminUser) => void
  onToggleStatus: (user: AdminUser) => void
  onDelete: (user: AdminUser) => void
}

/**
 * Admin accounts with per-row edit / activate / delete actions.
 *
 * Deactivating or deleting your own account is disabled here and refused by the
 * API — locking yourself out mid-session is never what was meant.
 */
export function UserTable({
  users,
  isLoading,
  isError,
  currentUserId,
  togglingId,
  onRetry,
  onEdit,
  onToggleStatus,
  onDelete,
}: UserTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='min-w-40'>Name</TableHead>
            <TableHead className='min-w-48'>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last login</TableHead>
            <TableHead className='text-end'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <DataLoading colSpan={COL_SPAN} />}
          {!isLoading && isError && (
            <DataError colSpan={COL_SPAN} onRetry={onRetry} />
          )}
          {!isLoading && !isError && users.length === 0 && (
            <EmptyRow colSpan={COL_SPAN} label='No users found.' />
          )}
          {!isLoading &&
            !isError &&
            users.map((user) => {
              const isSelf = user._id === currentUserId
              return (
                <TableRow key={user._id}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-1.5'>
                      <span className='line-clamp-1'>{user.name}</span>
                      {isSelf && (
                        <span className='text-xs text-muted-foreground'>
                          (you)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={normalizeRole(user.role)} />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge isActive={user.isActive} />
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {fmtDate(user.lastLogin)}
                  </TableCell>
                  <TableCell className='text-end'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        title='Edit'
                        onClick={() => onEdit(user)}
                      >
                        <Pencil className='size-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        title={
                          isSelf
                            ? 'You cannot deactivate your own account'
                            : user.isActive
                              ? 'Deactivate'
                              : 'Activate'
                        }
                        disabled={isSelf || togglingId === user._id}
                        onClick={() => onToggleStatus(user)}
                      >
                        {user.isActive ? (
                          <PowerOff className='size-4' />
                        ) : (
                          <Power className='size-4' />
                        )}
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        title={
                          isSelf
                            ? 'You cannot delete your own account'
                            : 'Delete'
                        }
                        disabled={isSelf}
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className='size-4 text-destructive' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}
