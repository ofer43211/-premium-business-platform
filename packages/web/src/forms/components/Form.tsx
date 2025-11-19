/**
 * Form Component Wrapper
 * Provides form context and submission handling
 */
import React, { FormHTMLAttributes } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface FormProps<TFieldValues extends FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
}

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  ...formProps
}: FormProps<TFieldValues>) {
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate {...formProps}>
      {children}
    </form>
  );
}

// Submit Button Component
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  loadingText?: string;
}

export function SubmitButton({
  children,
  isSubmitting,
  loadingText = 'Submitting...',
  disabled,
  ...buttonProps
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting}
      className={`submit-button ${isSubmitting ? 'loading' : ''}`}
      data-testid="submit-button"
      {...buttonProps}
    >
      {isSubmitting ? loadingText : children}
    </button>
  );
}

// Form Error Summary Component
interface FormErrorSummaryProps {
  errors: Record<string, any>;
  title?: string;
}

export function FormErrorSummary({ errors, title = 'Please fix the following errors:' }: FormErrorSummaryProps) {
  const errorMessages = Object.entries(errors)
    .filter(([_, error]) => error?.message)
    .map(([field, error]) => ({
      field,
      message: error.message,
    }));

  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <div className="form-error-summary" role="alert" data-testid="form-error-summary">
      <h3 className="error-summary-title">{title}</h3>
      <ul className="error-summary-list">
        {errorMessages.map(({ field, message }) => (
          <li key={field} className="error-summary-item">
            <a href={`#field-${field}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
