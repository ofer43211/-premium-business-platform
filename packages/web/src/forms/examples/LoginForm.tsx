/**
 * Example: Login Form
 * Demonstrates React Hook Form + Zod integration with reusable components
 */
import React from 'react';
import { loginSchema } from '@premium-business/shared/schemas';
import { useZodForm } from '../hooks/useZodForm';
import { Form, SubmitButton, FormErrorSummary } from '../components/Form';
import { InputField, CheckboxField } from '../components/FormField';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  defaultEmail?: string;
}

export function LoginForm({ onSubmit, defaultEmail }: LoginFormProps) {
  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: defaultEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Form form={form} onSubmit={onSubmit} data-testid="login-form">
      <FormErrorSummary errors={errors} />

      <InputField
        name="email"
        register={register}
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        required
        autoComplete="email"
        data-testid="email-input"
      />

      <InputField
        name="password"
        register={register}
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        required
        autoComplete="current-password"
        data-testid="password-input"
      />

      <CheckboxField
        name="rememberMe"
        register={register}
        checkboxLabel="Remember me for 30 days"
        error={errors.rememberMe?.message}
        data-testid="remember-me-checkbox"
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Logging in...">
        Log In
      </SubmitButton>
    </Form>
  );
}
