/**
 * Tests for Form Components
 * Coverage: Form wrapper, SubmitButton, FormErrorSummary
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { Form, SubmitButton, FormErrorSummary } from '../components/Form';
import { InputField } from '../components/FormField';

// Test form component
function TestForm({
  onSubmit,
  defaultValues = {},
}: {
  onSubmit: (data: any) => void | Promise<void>;
  defaultValues?: any;
}) {
  const form = useForm({ defaultValues });
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Form form={form} onSubmit={onSubmit}>
      <InputField
        name="email"
        register={register}
        label="Email"
        error={errors.email?.message}
      />
      <InputField
        name="password"
        register={register}
        label="Password"
        error={errors.password?.message}
      />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}

describe('Form', () => {
  it('should render form with children', () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    render(
      <TestForm
        onSubmit={onSubmit}
        defaultValues={{ email: 'test@example.com', password: 'password123' }}
      />
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object)
      );
    });
  });

  it('should handle async onSubmit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <TestForm
        onSubmit={onSubmit}
        defaultValues={{ email: 'test@example.com', password: 'password123' }}
      />
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should catch errors in onSubmit', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const onSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));

    render(
      <TestForm
        onSubmit={onSubmit}
        defaultValues={{ email: 'test@example.com', password: 'password123' }}
      />
    );

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Form submission error:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('should prevent default form submission', () => {
    const onSubmit = jest.fn();
    const { container } = render(<TestForm onSubmit={onSubmit} />);

    const form = container.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');

    form?.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should have noValidate attribute', () => {
    const onSubmit = jest.fn();
    const { container } = render(<TestForm onSubmit={onSubmit} />);

    const form = container.querySelector('form');
    expect(form).toHaveAttribute('novalidate');
  });
});

describe('SubmitButton', () => {
  it('should render with children', () => {
    render(<SubmitButton>Submit Form</SubmitButton>);
    expect(screen.getByText('Submit Form')).toBeInTheDocument();
  });

  it('should have type submit', () => {
    render(<SubmitButton>Submit</SubmitButton>);
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should be disabled when isSubmitting is true', () => {
    render(<SubmitButton isSubmitting>Submit</SubmitButton>);
    const button = screen.getByTestId('submit-button');
    expect(button).toBeDisabled();
  });

  it('should show loading text when submitting', () => {
    render(
      <SubmitButton isSubmitting loadingText="Please wait...">
        Submit
      </SubmitButton>
    );
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('should use default loading text', () => {
    render(<SubmitButton isSubmitting>Submit</SubmitButton>);
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SubmitButton disabled>Submit</SubmitButton>);
    const button = screen.getByTestId('submit-button');
    expect(button).toBeDisabled();
  });

  it('should apply loading class when submitting', () => {
    render(<SubmitButton isSubmitting>Submit</SubmitButton>);
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveClass('loading');
  });

  it('should pass through additional props', () => {
    render(
      <SubmitButton className="custom-class" data-custom="value">
        Submit
      </SubmitButton>
    );
    const button = screen.getByTestId('submit-button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('data-custom', 'value');
  });
});

describe('FormErrorSummary', () => {
  it('should not render when no errors', () => {
    render(<FormErrorSummary errors={{}} />);
    expect(screen.queryByTestId('form-error-summary')).not.toBeInTheDocument();
  });

  it('should render error summary with errors', () => {
    const errors = {
      email: { message: 'Invalid email address' },
      password: { message: 'Password is too short' },
    };

    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is too short')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    const errors = {
      email: { message: 'Invalid email' },
    };

    render(<FormErrorSummary errors={errors} title="Form has errors:" />);

    expect(screen.getByText('Form has errors:')).toBeInTheDocument();
  });

  it('should use default title', () => {
    const errors = {
      email: { message: 'Invalid email' },
    };

    render(<FormErrorSummary errors={errors} />);

    expect(
      screen.getByText('Please fix the following errors:')
    ).toBeInTheDocument();
  });

  it('should have role alert', () => {
    const errors = {
      email: { message: 'Invalid email' },
    };

    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render links to fields', () => {
    const errors = {
      email: { message: 'Invalid email' },
      password: { message: 'Too short' },
    };

    render(<FormErrorSummary errors={errors} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '#field-email');
    expect(links[1]).toHaveAttribute('href', '#field-password');
  });

  it('should ignore errors without messages', () => {
    const errors = {
      email: { message: 'Invalid email' },
      password: {},
      name: { type: 'required' },
    };

    render(<FormErrorSummary errors={errors} />);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.queryByText('password')).not.toBeInTheDocument();
    expect(screen.queryByText('name')).not.toBeInTheDocument();
  });

  it('should render multiple errors correctly', () => {
    const errors = {
      firstName: { message: 'First name is required' },
      lastName: { message: 'Last name is required' },
      email: { message: 'Invalid email format' },
      password: { message: 'Password must be at least 8 characters' },
    };

    render(<FormErrorSummary errors={errors} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});

describe('Form Integration', () => {
  it('should show error summary on validation errors', async () => {
    const onSubmit = jest.fn();

    function FormWithValidation() {
      const form = useForm({
        defaultValues: { email: '', password: '' },
      });

      const handleSubmit = async (data: any) => {
        // Simulate validation errors
        form.setError('email', { message: 'Email is required' });
        form.setError('password', { message: 'Password is required' });
        onSubmit(data);
      };

      return (
        <Form form={form} onSubmit={handleSubmit}>
          <FormErrorSummary errors={form.formState.errors} />
          <InputField
            name="email"
            register={form.register}
            label="Email"
            error={form.formState.errors.email?.message}
          />
          <InputField
            name="password"
            register={form.register}
            label="Password"
            error={form.formState.errors.password?.message}
          />
          <SubmitButton>Submit</SubmitButton>
        </Form>
      );
    }

    render(<FormWithValidation />);

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
    });
  });
});
