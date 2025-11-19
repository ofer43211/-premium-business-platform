/**
 * Tests for SignupPage
 * Coverage: Form validation, submission, password confirmation
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ToastProvider } from '../../../toast';
import { SignupPage } from '../SignupPage';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>{children}</ToastProvider>
    </I18nextProvider>
  );
}

describe('SignupPage', () => {
  it('should render signup page', () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
    expect(screen.getByTestId('signup-title')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    expect(screen.getByTestId('signup-firstname')).toBeInTheDocument();
    expect(screen.getByTestId('signup-lastname')).toBeInTheDocument();
    expect(screen.getByTestId('signup-email')).toBeInTheDocument();
    expect(screen.getByTestId('signup-password')).toBeInTheDocument();
    expect(screen.getByTestId('signup-confirm-password')).toBeInTheDocument();
  });

  it('should call onSignup with correct data', async () => {
    const user = userEvent.setup();
    const onSignup = jest.fn().mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <SignupPage onSignup={onSignup} />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('signup-firstname'), 'John');
    await user.type(screen.getByTestId('signup-lastname'), 'Doe');
    await user.type(screen.getByTestId('signup-email'), 'john@example.com');
    await user.type(screen.getByTestId('signup-password'), 'Password123!');
    await user.type(screen.getByTestId('signup-confirm-password'), 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
        })
      );
    });
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SignupPage />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('signup-firstname'), 'John');
    await user.type(screen.getByTestId('signup-lastname'), 'Doe');
    await user.type(screen.getByTestId('signup-email'), 'john@example.com');
    await user.type(screen.getByTestId('signup-password'), 'Password123!');
    await user.type(screen.getByTestId('signup-confirm-password'), 'DifferentPassword!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords.*match/i)).toBeInTheDocument();
    });
  });

  it('should call onLogin when link is clicked', async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn();

    render(
      <TestWrapper>
        <SignupPage onLogin={onLogin} />
      </TestWrapper>
    );

    const link = screen.getByTestId('login-link');
    await user.click(link);

    expect(onLogin).toHaveBeenCalled();
  });

  it('should show error toast when email already exists', async () => {
    const user = userEvent.setup();
    const onSignup = jest
      .fn()
      .mockRejectedValue(new Error('Email already exists'));

    render(
      <TestWrapper>
        <SignupPage onSignup={onSignup} />
      </TestWrapper>
    );

    await user.type(screen.getByTestId('signup-firstname'), 'John');
    await user.type(screen.getByTestId('signup-lastname'), 'Doe');
    await user.type(screen.getByTestId('signup-email'), 'existing@example.com');
    await user.type(screen.getByTestId('signup-password'), 'Password123!');
    await user.type(screen.getByTestId('signup-confirm-password'), 'Password123!');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
