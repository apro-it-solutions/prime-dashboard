import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-client'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, USER_ROLES } from '@/lib/rbac'
import { type AdminUser, type AdminUserInput } from '@/types/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  emptyUserForm,
  formToUserInput,
  userFormSchema,
  userToForm,
  type UserFormValues,
} from './user-form-schema'

/** Form fields a backend validation error can be attached to. */
const FIELD_NAMES = ['name', 'email', 'password', 'role'] as const
type FieldName = (typeof FIELD_NAMES)[number]

const isFieldName = (value?: string): value is FieldName =>
  Boolean(value) && (FIELD_NAMES as readonly string[]).includes(value as string)

type UserFormDialogProps = {
  open: boolean
  /** The account being edited, or null to create a new one. */
  user: AdminUser | null
  /** The signed-in admin id — nobody may change their own role. */
  currentUserId?: string
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    input: Partial<AdminUserInput>,
    handlers: { onError: (error: unknown) => void; onSuccess: () => void }
  ) => void
}

/**
 * Add/edit dialog for an admin account.
 *
 * Both modes share one form: on edit the password field is optional and simply
 * left blank to keep the current one. The role select and the active switch are
 * locked when an administrator opens their own row — the API refuses a self
 * role change or self deactivation, so offering either would only produce a 403.
 */
export function UserFormDialog({
  open,
  user,
  currentUserId,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: UserFormDialogProps) {
  const isEdit = Boolean(user)
  const isSelf = Boolean(user && user._id === currentUserId)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: emptyUserForm(),
  })

  // One dialog instance serves every row, so reset it to the record being
  // opened rather than leaving the previous account values in the inputs.
  const { reset } = form
  useEffect(() => {
    if (open) {
      reset(user ? userToForm(user) : emptyUserForm())
    }
  }, [open, user, reset])

  const handleSubmit = form.handleSubmit((values) => {
    form.clearErrors('root')
    onSubmit(formToUserInput(values), {
      onSuccess: () => onOpenChange(false),
      onError: (error) => {
        // Per-field details (a duplicate email, say) land on the input; the
        // rest becomes a message above the buttons.
        const fieldErrors = getApiFieldErrors(error).filter((detail) =>
          isFieldName(detail.field)
        )
        for (const detail of fieldErrors) {
          form.setError(detail.field as FieldName, { message: detail.message })
        }
        if (fieldErrors.length === 0) {
          form.setError('root', { message: getApiErrorMessage(error) })
        }
      },
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit user' : 'Add user'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the account details, role and access.'
              : 'Create an account and choose what it may reach.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Jane Doe' autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='jane@primenms.com'
                      autoComplete='off'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEdit ? 'New password' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='At least 8 characters'
                      autoComplete='new-password'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  {isEdit && (
                    <FormDescription>
                      Leave blank to keep the current password. Setting a new one
                      signs this account out everywhere.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSelf}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {isSelf
                      ? 'You cannot change your own role.'
                      : ROLE_DESCRIPTIONS[field.value]}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                  <div>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      {isSelf
                        ? 'You cannot deactivate your own account.'
                        : 'An inactive account cannot sign in.'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSelf}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && <Loader2 className='size-4 animate-spin' />}
                {isEdit ? 'Save changes' : 'Add user'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
