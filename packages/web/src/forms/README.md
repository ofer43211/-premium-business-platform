# Forms Module

React Hook Form + Zod integration with reusable, accessible form components.

## Features

- ✅ Type-safe forms with Zod validation
- ✅ Reusable field components (Input, Textarea, Select, Checkbox, Radio)
- ✅ RTL (Right-to-Left) support for Hebrew and Arabic
- ✅ Accessible (ARIA attributes, proper labeling)
- ✅ Error handling and display
- ✅ Loading states
- ✅ Form error summary
- ✅ Comprehensive test coverage

## Quick Start

### 1. Define a Zod Schema

```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});
```

### 2. Create a Form Component

```typescript
import { useZodForm } from '@/forms';
import { Form, SubmitButton } from '@/forms';
import { InputField, CheckboxField } from '@/forms';

function LoginForm({ onSubmit }) {
  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const { register, formState: { errors, isSubmitting } } = form;

  return (
    <Form form={form} onSubmit={onSubmit}>
      <InputField
        name="email"
        register={register}
        label="Email Address"
        type="email"
        error={errors.email?.message}
        required
      />

      <InputField
        name="password"
        register={register}
        label="Password"
        type="password"
        error={errors.password?.message}
        required
      />

      <CheckboxField
        name="rememberMe"
        register={register}
        checkboxLabel="Remember me"
      />

      <SubmitButton isSubmitting={isSubmitting}>
        Log In
      </SubmitButton>
    </Form>
  );
}
```

## Components

### Form

Wrapper component that handles form submission.

```typescript
<Form form={form} onSubmit={handleSubmit}>
  {/* form fields */}
</Form>
```

**Props:**
- `form` - React Hook Form instance from `useZodForm`
- `onSubmit` - Submit handler function
- All standard HTML form attributes

### InputField

Text input field with label, error display, and validation.

```typescript
<InputField
  name="email"
  register={register}
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email?.message}
  helperText="We'll never share your email"
  required
  dir="rtl" // For RTL languages
/>
```

**Props:**
- `name` - Field name (must match schema)
- `register` - React Hook Form register function
- `label` - Field label
- `error` - Error message to display
- `helperText` - Helper text (hidden when error exists)
- `required` - Show required indicator (*)
- `dir` - Text direction: 'ltr', 'rtl', or 'auto'
- All standard HTML input attributes

### TextareaField

Multi-line text input with same props as InputField.

```typescript
<TextareaField
  name="bio"
  register={register}
  label="Biography"
  rows={5}
  error={errors.bio?.message}
  helperText="Maximum 500 characters"
/>
```

### SelectField

Dropdown select field.

```typescript
<SelectField
  name="language"
  register={register}
  label="Language"
  options={[
    { value: 'en', label: 'English' },
    { value: 'he', label: 'עברית' },
    { value: 'ar', label: 'العربية' },
  ]}
  placeholder="Select a language"
  error={errors.language?.message}
  required
/>
```

**Props:**
- `options` - Array of { value, label } objects
- `placeholder` - Placeholder option (disabled)
- Other props same as InputField

### CheckboxField

Checkbox input.

```typescript
<CheckboxField
  name="terms"
  register={register}
  checkboxLabel="I agree to the terms and conditions"
  error={errors.terms?.message}
  required
/>
```

**Props:**
- `checkboxLabel` - Label next to checkbox
- `label` - Optional field group label
- Other props same as InputField

### RadioGroupField

Radio button group.

```typescript
<RadioGroupField
  name="theme"
  register={register}
  label="Theme Preference"
  options={[
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ]}
  error={errors.theme?.message}
  required
/>
```

### SubmitButton

Submit button with loading state.

```typescript
<SubmitButton
  isSubmitting={isSubmitting}
  loadingText="Saving..."
>
  Save Changes
</SubmitButton>
```

**Props:**
- `isSubmitting` - Show loading state
- `loadingText` - Text to show during loading (default: "Submitting...")
- All standard HTML button attributes

### FormErrorSummary

Displays a summary of all form errors (accessibility feature).

```typescript
<FormErrorSummary
  errors={errors}
  title="Please fix the following errors:"
/>
```

**Props:**
- `errors` - Form errors object
- `title` - Summary heading

## RTL (Right-to-Left) Support

All form fields support RTL text direction for Hebrew and Arabic:

```typescript
// Automatic direction based on language
const isRTL = currentLanguage === 'he' || currentLanguage === 'ar';
const dir = isRTL ? 'rtl' : 'ltr';

<InputField
  name="name"
  register={register}
  label="Name"
  dir={dir}
/>
```

## Accessibility

All components follow accessibility best practices:

- ✅ Proper label-input associations (`htmlFor` / `id`)
- ✅ ARIA attributes (`aria-invalid`, `aria-describedby`)
- ✅ Error announcements with `role="alert"`
- ✅ Keyboard navigation support
- ✅ Required field indicators
- ✅ Focus management

## Testing

All components have comprehensive test coverage. See `__tests__/` directory.

```bash
# Run tests
npm test -- src/forms

# Run with coverage
npm test -- --coverage src/forms
```

## Example Forms

See the `examples/` directory for complete form implementations:

- **LoginForm** - Email/password with remember me
- **ProfileForm** - Complex form with multiple field types and RTL support

## Type Safety

TypeScript types are automatically inferred from your Zod schema:

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

const form = useZodForm({ schema });

// form values are properly typed:
// { email: string; age: number }
```

## Integration with Existing Schemas

Use the Zod schemas from `@premium-business/shared/schemas`:

```typescript
import { loginSchema, signupSchema } from '@premium-business/shared/schemas';
import { useZodForm } from '@/forms';

const form = useZodForm({ schema: loginSchema });
```

## Advanced Usage

### Custom Validation

```typescript
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### Conditional Fields

```typescript
const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  businessName: z.string().optional(),
}).refine((data) => {
  if (data.accountType === 'business') {
    return !!data.businessName;
  }
  return true;
}, {
  message: 'Business name is required',
  path: ['businessName'],
});
```

### Dynamic Forms

```typescript
const form = useZodForm({ schema });

// Show/hide fields based on values
const accountType = form.watch('accountType');

return (
  <Form form={form} onSubmit={onSubmit}>
    <SelectField name="accountType" ... />

    {accountType === 'business' && (
      <InputField name="businessName" ... />
    )}
  </Form>
);
```

## Best Practices

1. **Always use Zod schemas** - Define validation in schemas, not in components
2. **Reuse schemas** - Import from `@premium-business/shared/schemas`
3. **Show helper text** - Guide users with helpful hints
4. **Display errors clearly** - Use both inline errors and FormErrorSummary
5. **Support RTL** - Always consider Hebrew/Arabic users
6. **Test thoroughly** - Write tests for validation logic
7. **Keep forms accessible** - Use proper labels, ARIA attributes, and keyboard navigation

## Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [ARIA Authoring Practices - Forms](https://www.w3.org/WAI/ARIA/apg/patterns/)
