/**
 * React Hook Form + Zod Integration
 * Custom hook for form handling with Zod validation
 */
import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface UseZodFormProps<TSchema extends z.ZodType<any, any, any>>
  extends Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> {
  schema: TSchema;
}

/**
 * Custom hook that integrates React Hook Form with Zod validation
 *
 * @example
 * const form = useZodForm({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' }
 * });
 */
export function useZodForm<TSchema extends z.ZodType<any, any, any>>({
  schema,
  ...formConfig
}: UseZodFormProps<TSchema>): UseFormReturn<z.infer<TSchema>> {
  return useForm({
    ...formConfig,
    resolver: zodResolver(schema),
  });
}

/**
 * Type helper to extract form values from Zod schema
 */
export type InferZodForm<TSchema extends z.ZodType<any, any, any>> = z.infer<TSchema>;

/**
 * Helper to get field error message
 */
export function getFieldError(
  errors: any,
  fieldName: string
): string | undefined {
  const keys = fieldName.split('.');
  let error = errors;

  for (const key of keys) {
    error = error?.[key];
  }

  return error?.message;
}

/**
 * Helper to check if field has error
 */
export function hasFieldError(errors: any, fieldName: string): boolean {
  return !!getFieldError(errors, fieldName);
}
