/**
 * Form Field Components
 * Reusable form fields with React Hook Form integration
 */
import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
}

// Input Field
interface InputFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
}

export function InputField<TFieldValues extends FieldValues>({
  name,
  register,
  label,
  error,
  helperText,
  required,
  dir = 'auto',
  ...inputProps
}: InputFieldProps<TFieldValues>) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-field" data-testid={`form-field-${name}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        className={`form-input ${error ? 'error' : ''}`}
        dir={dir}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...register(name)}
        {...inputProps}
      />
      {error && (
        <div
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          data-testid={`error-${name}`}
        >
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={`${fieldId}-helper`} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  );
}

// Textarea Field
interface TextareaFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
}

export function TextareaField<TFieldValues extends FieldValues>({
  name,
  register,
  label,
  error,
  helperText,
  required,
  dir = 'auto',
  ...textareaProps
}: TextareaFieldProps<TFieldValues>) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-field" data-testid={`form-field-${name}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        className={`form-textarea ${error ? 'error' : ''}`}
        dir={dir}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...register(name)}
        {...textareaProps}
      />
      {error && (
        <div
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          data-testid={`error-${name}`}
        >
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={`${fieldId}-helper`} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  );
}

// Select Field
interface SelectFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField<TFieldValues extends FieldValues>({
  name,
  register,
  label,
  error,
  helperText,
  required,
  options,
  placeholder,
  dir = 'auto',
  ...selectProps
}: SelectFieldProps<TFieldValues>) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-field" data-testid={`form-field-${name}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`form-label ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        id={fieldId}
        className={`form-select ${error ? 'error' : ''}`}
        dir={dir}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        {...register(name)}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          data-testid={`error-${name}`}
        >
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={`${fieldId}-helper`} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  );
}

// Checkbox Field
interface CheckboxFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  checkboxLabel?: string;
}

export function CheckboxField<TFieldValues extends FieldValues>({
  name,
  register,
  label,
  checkboxLabel,
  error,
  helperText,
  required,
  dir = 'auto',
  ...inputProps
}: CheckboxFieldProps<TFieldValues>) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-field checkbox-field" data-testid={`form-field-${name}`}>
      {label && (
        <div className={`form-label ${required ? 'required' : ''}`}>
          {label}
          {required && <span className="required-mark">*</span>}
        </div>
      )}
      <div className="checkbox-wrapper">
        <input
          id={fieldId}
          type="checkbox"
          className={`form-checkbox ${error ? 'error' : ''}`}
          dir={dir}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          {...register(name)}
          {...inputProps}
        />
        {checkboxLabel && (
          <label htmlFor={fieldId} className="checkbox-label">
            {checkboxLabel}
          </label>
        )}
      </div>
      {error && (
        <div
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          data-testid={`error-${name}`}
        >
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={`${fieldId}-helper`} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  );
}

// Radio Group Field
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupFieldProps<TFieldValues extends FieldValues>
  extends BaseFieldProps {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  options: RadioOption[];
}

export function RadioGroupField<TFieldValues extends FieldValues>({
  name,
  register,
  label,
  error,
  helperText,
  required,
  options,
  dir = 'auto',
}: RadioGroupFieldProps<TFieldValues>) {
  const fieldId = `field-${name}`;

  return (
    <div className="form-field radio-group-field" data-testid={`form-field-${name}`}>
      {label && (
        <div className={`form-label ${required ? 'required' : ''}`}>
          {label}
          {required && <span className="required-mark">*</span>}
        </div>
      )}
      <div className="radio-group" dir={dir} role="radiogroup">
        {options.map((option) => (
          <div key={option.value} className="radio-wrapper">
            <input
              id={`${fieldId}-${option.value}`}
              type="radio"
              value={option.value}
              className={`form-radio ${error ? 'error' : ''}`}
              aria-invalid={!!error}
              {...register(name)}
            />
            <label htmlFor={`${fieldId}-${option.value}`} className="radio-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <div
          id={`${fieldId}-error`}
          className="form-error"
          role="alert"
          data-testid={`error-${name}`}
        >
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={`${fieldId}-helper`} className="form-helper">
          {helperText}
        </div>
      )}
    </div>
  );
}
