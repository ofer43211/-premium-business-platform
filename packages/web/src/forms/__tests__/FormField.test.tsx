/**
 * Tests for Form Field Components
 * Coverage: InputField, TextareaField, SelectField, CheckboxField, RadioGroupField
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
  RadioGroupField,
} from '../components/FormField';

// Test wrapper component
function TestWrapper<T extends Record<string, any>>({
  children,
  defaultValues,
}: {
  children: (register: any) => React.ReactNode;
  defaultValues?: T;
}) {
  const { register } = useForm({ defaultValues });
  return <>{children(register)}</>;
}

describe('InputField', () => {
  it('should render input with label', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField name="email" register={register} label="Email Address" />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField name="email" register={register} label="Email" required />
        )}
      </TestWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            error="Invalid email address"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId('error-email')).toHaveTextContent('Invalid email address');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should display helper text when no error', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            helperText="We'll never share your email"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
  });

  it('should not display helper text when error exists', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            error="Invalid email"
            helperText="We'll never share your email"
          />
        )}
      </TestWrapper>
    );

    expect(screen.queryByText("We'll never share your email")).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should apply RTL direction', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField name="name" register={register} label="Name" dir="rtl" />
        )}
      </TestWrapper>
    );

    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('dir', 'rtl');
  });

  it('should set aria-invalid when error exists', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            error="Invalid"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should pass through input props', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });
});

describe('TextareaField', () => {
  it('should render textarea with label', () => {
    render(
      <TestWrapper>
        {(register) => (
          <TextareaField name="bio" register={register} label="Biography" />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText('Biography')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-bio')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <TestWrapper>
        {(register) => (
          <TextareaField
            name="bio"
            register={register}
            label="Bio"
            error="Too long"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId('error-bio')).toHaveTextContent('Too long');
  });

  it('should pass through textarea props', () => {
    render(
      <TestWrapper>
        {(register) => (
          <TextareaField
            name="bio"
            register={register}
            label="Bio"
            rows={5}
            placeholder="Tell us about yourself"
          />
        )}
      </TestWrapper>
    );

    const textarea = screen.getByLabelText('Bio');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('placeholder', 'Tell us about yourself');
  });
});

describe('SelectField', () => {
  const options = [
    { value: 'en', label: 'English' },
    { value: 'he', label: 'Hebrew' },
    { value: 'ar', label: 'Arabic' },
  ];

  it('should render select with options', () => {
    render(
      <TestWrapper>
        {(register) => (
          <SelectField
            name="language"
            register={register}
            label="Language"
            options={options}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hebrew')).toBeInTheDocument();
    expect(screen.getByText('Arabic')).toBeInTheDocument();
  });

  it('should render placeholder option', () => {
    render(
      <TestWrapper>
        {(register) => (
          <SelectField
            name="language"
            register={register}
            label="Language"
            options={options}
            placeholder="Select a language"
          />
        )}
      </TestWrapper>
    );

    const placeholder = screen.getByText('Select a language');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveAttribute('disabled');
  });

  it('should display error message', () => {
    render(
      <TestWrapper>
        {(register) => (
          <SelectField
            name="language"
            register={register}
            label="Language"
            options={options}
            error="Please select a language"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId('error-language')).toHaveTextContent(
      'Please select a language'
    );
  });
});

describe('CheckboxField', () => {
  it('should render checkbox with label', () => {
    render(
      <TestWrapper>
        {(register) => (
          <CheckboxField
            name="terms"
            register={register}
            checkboxLabel="I agree to the terms"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByLabelText('I agree to the terms')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-terms')).toBeInTheDocument();
  });

  it('should render with field label and checkbox label', () => {
    render(
      <TestWrapper>
        {(register) => (
          <CheckboxField
            name="terms"
            register={register}
            label="Legal"
            checkboxLabel="I agree to the terms"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByLabelText('I agree to the terms')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <TestWrapper>
        {(register) => (
          <CheckboxField
            name="terms"
            register={register}
            checkboxLabel="I agree"
            error="You must agree to continue"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId('error-terms')).toHaveTextContent(
      'You must agree to continue'
    );
  });

  it('should have type checkbox', () => {
    render(
      <TestWrapper>
        {(register) => (
          <CheckboxField
            name="terms"
            register={register}
            checkboxLabel="I agree"
          />
        )}
      </TestWrapper>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
  });
});

describe('RadioGroupField', () => {
  const options = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto' },
  ];

  it('should render radio group with options', () => {
    render(
      <TestWrapper>
        {(register) => (
          <RadioGroupField
            name="theme"
            register={register}
            label="Theme"
            options={options}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Light Theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark Theme')).toBeInTheDocument();
    expect(screen.getByLabelText('Auto')).toBeInTheDocument();
  });

  it('should have radiogroup role', () => {
    render(
      <TestWrapper>
        {(register) => (
          <RadioGroupField
            name="theme"
            register={register}
            label="Theme"
            options={options}
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <TestWrapper>
        {(register) => (
          <RadioGroupField
            name="theme"
            register={register}
            label="Theme"
            options={options}
            error="Please select a theme"
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByTestId('error-theme')).toHaveTextContent(
      'Please select a theme'
    );
  });

  it('should show required indicator when required', () => {
    render(
      <TestWrapper>
        {(register) => (
          <RadioGroupField
            name="theme"
            register={register}
            label="Theme"
            options={options}
            required
          />
        )}
      </TestWrapper>
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should apply RTL direction to radio group', () => {
    render(
      <TestWrapper>
        {(register) => (
          <RadioGroupField
            name="theme"
            register={register}
            label="Theme"
            options={options}
            dir="rtl"
          />
        )}
      </TestWrapper>
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toHaveAttribute('dir', 'rtl');
  });
});

describe('Accessibility', () => {
  it('should link label to input via htmlFor and id', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField name="email" register={register} label="Email Address" />
        )}
      </TestWrapper>
    );

    const label = screen.getByText('Email Address');
    const input = screen.getByLabelText('Email Address');

    expect(label).toHaveAttribute('for', 'field-email');
    expect(input).toHaveAttribute('id', 'field-email');
  });

  it('should use aria-describedby for errors', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            error="Invalid email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'field-email-error');
  });

  it('should use aria-describedby for helper text', () => {
    render(
      <TestWrapper>
        {(register) => (
          <InputField
            name="email"
            register={register}
            label="Email"
            helperText="Enter your email"
          />
        )}
      </TestWrapper>
    );

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'field-email-helper');
  });
});
