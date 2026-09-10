import { z } from 'zod'
import { USER_ROLES, normalizeRole } from '@/lib/rbac'
import { type AdminUser, type AdminUserInput } from '@/types/api'

/**
 * Create/edit form for an admin account.
 *
 * `password` is required on create and optional on edit (blank leaves the
 * current one alone), which is why the rule lives in a superRefine rather than
 * in the field itself — the same schema then serves both modes.
 */
export const userFormSchema = z
  .object({
    mode: z.enum(['create', 'edit']),
    name: z
      .string()
      .trim()
      .min(2, 'Please enter a full name')
      .max(120, 'Name is too long'),
    email: z.string().trim().email('A valid email is required'),
    password: z.string().max(128, 'Password is too long').optional(),
    role: z.enum(USER_ROLES),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const password = values.password ?? ''
    if (values.mode === 'create' && password.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password is required',
      })
      return
    }
    if (password.length > 0 && password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password must be at least 8 characters',
      })
    }
  })

export type UserFormValues = z.infer<typeof userFormSchema>

export const emptyUserForm = (): UserFormValues => ({
  mode: 'create',
  name: '',
  email: '',
  password: '',
  role: 'platform_user',
  isActive: true,
})

/** API user -> form values (for the edit dialog). */
export function userToForm(user: AdminUser): UserFormValues {
  return {
    mode: 'edit',
    name: user.name,
    email: user.email,
    password: '',
    role: normalizeRole(user.role),
    isActive: user.isActive,
  }
}

/**
 * Form values -> API payload.
 *
 * A blank password is dropped rather than sent: the update endpoint treats an
 * absent `password` as "leave it alone" and would reject an empty string.
 */
export function formToUserInput(
  values: UserFormValues
): Partial<AdminUserInput> {
  const password = values.password?.trim()
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    role: values.role,
    isActive: values.isActive,
    ...(password ? { password } : {}),
  }
}
