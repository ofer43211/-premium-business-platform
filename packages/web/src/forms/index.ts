/**
 * Forms Module
 * React Hook Form + Zod integration with reusable components
 */

// Hooks
export { useZodForm, getFieldError, hasFieldError } from './hooks/useZodForm';
export type { UseZodFormProps, InferZodForm } from './hooks/useZodForm';

// Form Components
export { Form, SubmitButton, FormErrorSummary } from './components/Form';

// Field Components
export {
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioGroupField,
} from './components/FormField';

// Example Forms (for reference)
export { LoginForm } from './examples/LoginForm';
export { ProfileForm } from './examples/ProfileForm';
