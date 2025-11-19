/**
 * Tests for LoginForm Example
 * Coverage: Complete form integration with Zod validation
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../examples/LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('remember-me-checkbox')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should render with labels', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Remember me for 30 days')).toBeInTheDocument();
    });

    it('should render with placeholders', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('should render with default email when provided', () => {
      render(
        <LoginForm onSubmit={mockOnSubmit} defaultEmail="test@example.com" />
      );

      const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-email')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-password')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid login credentials', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
          })
        );
      });
    });
  });

  describe('Remember Me Checkbox', () => {
    it('should default to unchecked', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByTestId(
        'remember-me-checkbox'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const checkbox = screen.getByLabelText('Remember me for 30 days');

      expect(checkbox).not.toBeChecked();
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should submit with rememberMe value', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const rememberMeCheckbox = screen.getByLabelText('Remember me for 30 days');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            rememberMe: true,
          })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowSubmit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm onSubmit={slowSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText('Log In')).toBeInTheDocument();
      });
    });

    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const failingSubmit = jest
        .fn()
        .mockRejectedValue(new Error('Network error'));

      render(<LoginForm onSubmit={failingSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should still call the submit function
      await waitFor(() => {
        expect(failingSubmit).toHaveBeenCalled();
      });
    });

    it('should not submit form when Enter is pressed with invalid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');

      await user.type(emailInput, 'invalid-email{Enter}');

      // Wait a bit to ensure no submission
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form when Enter is pressed with valid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper autocomplete attributes', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput).toHaveAttribute('autocomplete', 'email');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('should have proper input types', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should mark required fields', () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getAllByText('*')).toHaveLength(2); // Email and Password
    });

    it('should have aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByTestId('submit-button');

      await user.type(emailInput, 'invalid');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Error Summary', () => {
    it('should show error summary with multiple errors', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId('submit-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
      });
    });
  });
});
