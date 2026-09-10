import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ROLE_LABELS, USER_ROLES, type UserRole } from '@/lib/rbac'
import { type AdminUser, type AdminUserListQuery } from '@/types/api'
import {
  useCreateUser,
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUser,
  useUsers,
} from '@/hooks/use-users'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ListPagination } from '@/components/list-pagination'
import { DeleteUserDialog } from '@/components/dashboard/users/delete-user-dialog'
import { UserFormDialog } from '@/components/dashboard/users/user-form-dialog'
import { UserSearch } from '@/components/dashboard/users/user-search'
import { UserTable } from '@/components/dashboard/users/user-table'

const PAGE_SIZE = 10
const ROLE_ALL = 'all'
const STATUS_ALL = 'all'

/**
 * Users module — Super Admin only.
 *
 * Reachable only with USER_VIEW: the sidebar entry is filtered out for anyone
 * else, the route is wrapped in a permission guard, and /users answers 403
 * regardless of either.
 */
export function Users() {
  const currentUserId = useAuthStore((s) => s.auth.user?._id)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>(ROLE_ALL)
  const [status, setStatus] = useState<string>(STATUS_ALL)

  const params: AdminUserListQuery = {
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(role !== ROLE_ALL ? { role: role as UserRole } : {}),
    ...(status !== STATUS_ALL
      ? { isActive: status === 'active' ? ('true' as const) : ('false' as const) }
      : {}),
  }

  const { data, isLoading, isError, refetch } = useUsers(params)
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const toggleMutation = useToggleUserStatus()
  const deleteMutation = useDeleteUser()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)

  const users = data?.items ?? []
  const resetPage = () => setPage(1)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditing(user)
    setFormOpen(true)
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Users</h1>
            <p className='text-muted-foreground'>
              Manage dashboard accounts and what each role can reach.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus /> Add User
          </Button>
        </div>

        <div className='mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
          <UserSearch
            onChange={(value) => {
              setSearch(value)
              resetPage()
            }}
          />
          <div className='flex gap-2'>
            <Select
              value={role}
              onValueChange={(value) => {
                setRole(value)
                resetPage()
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLE_ALL}>All roles</SelectItem>
                {USER_ROLES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ROLE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                resetPage()
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <UserTable
          users={users}
          isLoading={isLoading}
          isError={isError}
          currentUserId={currentUserId}
          togglingId={
            toggleMutation.isPending ? toggleMutation.variables?.id : undefined
          }
          onRetry={() => refetch()}
          onEdit={openEdit}
          onToggleStatus={(user) =>
            toggleMutation.mutate({ id: user._id, isActive: !user.isActive })
          }
          onDelete={setDeleting}
        />

        <ListPagination meta={data?.meta} page={page} onPageChange={setPage} />
      </Main>

      <UserFormDialog
        open={formOpen}
        user={editing}
        currentUserId={currentUserId}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setFormOpen}
        onSubmit={(input, handlers) => {
          if (editing) {
            updateMutation.mutate(
              { id: editing._id, input },
              {
                onSuccess: () => handlers.onSuccess(),
                onError: handlers.onError,
              }
            )
            return
          }
          // Create requires a password; the form guarantees one in this mode.
          createMutation.mutate(
            {
              name: input.name as string,
              email: input.email as string,
              password: input.password as string,
              role: input.role as UserRole,
              isActive: input.isActive,
            },
            { onSuccess: () => handlers.onSuccess(), onError: handlers.onError }
          )
        }}
      />

      <DeleteUserDialog
        user={deleting}
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={(user) =>
          deleteMutation.mutate(user._id, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </>
  )
}
