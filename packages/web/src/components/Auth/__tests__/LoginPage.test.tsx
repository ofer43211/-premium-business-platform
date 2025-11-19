/**
 * Tests for LoginPage
 * Coverage: Form validation, submission, navigation
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ToastProvider } from '../../../toast';
import { LoginPage } from '../LoginPage';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>{children}</ToastProvider>
    </I18nextProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login page', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-title')).toBeInTheDocument();
    });

    it('should render email and password fields', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('login-email')).toBeInTheDocument();
      expect(screen.getByTestId('login-password')).toBeInTheDocument();
    });

    it('should render remember me checkbox', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('login-remember')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should render forgot password link when callback provided', () => {
      const onForgotPassword = jest.fn();

      render(
        <TestWrapper>
          <LoginPage onForgotPassword={onForgotPassword} />
        </TestWrapper>
      );

      expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    });

    it('should not render forgot password link when no callback', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.queryByTestId('forgot-password-link')).not.toBeInTheDocument();
    });

    it('should render signup link when callback provided', () => {
      const onSignup = jest.fn();

      render(
        <TestWrapper>
          <LoginPage onSignup={onSignup} />
        </TestWrapper>
      );

      expect(screen.getByTestId('signup-link')).toBeInTheDocument();
    });

    it('should not render signup link when no callback', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.queryByTestId('signup-link')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty email', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /log in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('form-error-summary')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onLogin with correct data', async () => {
      const user = userEvent.setup();
      const onLogin = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <LoginPage onLogin={onLogin} />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const onLogin = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <LoginPage onLogin={onLogin} />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should show error toast on login failure', async () => {
      const user = userEvent.setup();
      const onLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage onLogin={onLogin} />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Remember Me', () => {
    it('should toggle remember me checkbox', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId('login-remember') as HTMLInputElement;

      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should call onForgotPassword when link is clicked', async () => {
      const user = userEvent.setup();
      const onForgotPassword = jest.fn();

      render(
        <TestWrapper>
          <LoginPage onForgotPassword={onForgotPassword} />
        </TestWrapper>
      );

      const link = screen.getByTestId('forgot-password-link');
      await user.click(link);

      expect(onForgotPassword).toHaveBeenCalled();
    });

    it('should call onSignup when link is clicked', async () => {
      const user = userEvent.setup();
      const onSignup = jest.fn();

      render(
        <TestWrapper>
          <LoginPage onSignup={onSignup} />
        </TestWrapper>
      );

      const link = screen.getByTestId('signup-link');
      await user.click(link);

      expect(onSignup).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have autofocus on email field', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('login-email');
      expect(emailInput).toHaveAttribute('autofocus');
    });

    it('should have proper autocomplete attributes', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('login-email')).toHaveAttribute(
        'autocomplete',
        'email'
      );
      expect(screen.getByTestId('login-password')).toHaveAttribute(
        'autocomplete',
        'current-password'
      );
    });
  });
});
