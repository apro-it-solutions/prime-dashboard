import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '@/lib/utils'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AuthPasswordInput } from './auth-password-input'
import {
  AUTH_FIELD_GAP,
  AUTH_INPUT_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_MESSAGE_CLASS,
} from './auth-styles'

type BaseFieldProps<T extends FieldValues> = {
  name: FieldPath<T>
  label: string
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  className?: string
}

/**
 * Text input styled to the shared auth design. Reads `control` from the
 * surrounding <Form> so callers only pass the field's name and label.
 */
export function AuthTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
  disabled,
  className,
  type = 'text',
  inputMode,
}: BaseFieldProps<T> & {
  type?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'email' | 'tel'
}) {
  const { control } = useFormContext<T>()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('grid', AUTH_FIELD_GAP, className)}>
          <FormLabel className={AUTH_LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className={AUTH_INPUT_CLASS}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage className={AUTH_MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  )
}

/** Password input with a visibility toggle, styled to the shared auth design. */
export function AuthPasswordField<T extends FieldValues>({
  name,
  label,
  placeholder,
  autoComplete,
  disabled,
  className,
}: BaseFieldProps<T>) {
  const { control } = useFormContext<T>()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('grid', AUTH_FIELD_GAP, className)}>
          <FormLabel className={AUTH_LABEL_CLASS}>{label}</FormLabel>
          <FormControl>
            <AuthPasswordInput
              autoComplete={autoComplete}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage className={AUTH_MESSAGE_CLASS} />
        </FormItem>
      )}
    />
  )
}
