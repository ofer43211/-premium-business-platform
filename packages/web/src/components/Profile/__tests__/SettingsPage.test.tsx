/**
 * Tests for SettingsPage Component
 * Coverage: Settings management, theme, notifications, privacy, account deletion
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ThemeProvider } from '../../../theme';
import { ToastProvider } from '../../../toast';
import { SettingsPage, UserSettings } from '../SettingsPage';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const mockSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
  },
  privacy: {
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  },
  preferences: {
    theme: 'auto',
    language: 'en',
    timezone: 'UTC',
  },
};

describe('SettingsPage', () => {
  describe('Rendering', () => {
    it('should render settings page', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('settings-title')).toBeInTheDocument();
    });

    it('should render appearance settings', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('appearance-settings')).toBeInTheDocument();
    });

    it('should render notification settings', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('notification-settings')).toBeInTheDocument();
    });

    it('should render privacy settings', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('privacy-settings')).toBeInTheDocument();
    });

    it('should render account settings', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );
      expect(screen.getByTestId('account-settings')).toBeInTheDocument();
    });
  });

  describe('Theme Settings', () => {
    it('should render theme buttons', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('theme-light')).toBeInTheDocument();
      expect(screen.getByTestId('theme-dark')).toBeInTheDocument();
      expect(screen.getByTestId('theme-auto')).toBeInTheDocument();
    });

    it('should select current theme', () => {
      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      const autoButton = screen.getByTestId('theme-auto');
      expect(autoButton).toHaveClass('button-primary');
    });

    it('should change theme on button click', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('theme-light'));

      const lightButton = screen.getByTestId('theme-light');
      expect(lightButton).toHaveClass('button-primary');
    });
  });

  describe('Language Settings', () => {
    it('should render language select', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });

    it('should show current language', () => {
      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      expect(screen.getByTestId('language-select')).toHaveValue('en');
    });

    it('should change language on select', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      await user.selectOptions(screen.getByTestId('language-select'), 'he');

      expect(screen.getByTestId('language-select')).toHaveValue('he');
    });
  });

  describe('Notification Settings', () => {
    it('should render all notification toggles', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('notification-email')).toBeInTheDocument();
      expect(screen.getByTestId('notification-push')).toBeInTheDocument();
      expect(screen.getByTestId('notification-sms')).toBeInTheDocument();
      expect(screen.getByTestId('notification-marketing')).toBeInTheDocument();
    });

    it('should reflect current notification settings', () => {
      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      expect(screen.getByTestId('notification-email')).toBeChecked();
      expect(screen.getByTestId('notification-push')).toBeChecked();
      expect(screen.getByTestId('notification-sms')).not.toBeChecked();
      expect(screen.getByTestId('notification-marketing')).not.toBeChecked();
    });

    it('should toggle notification settings', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      const emailToggle = screen.getByTestId('notification-email');
      expect(emailToggle).toBeChecked();

      await user.click(emailToggle);
      expect(emailToggle).not.toBeChecked();
    });
  });

  describe('Privacy Settings', () => {
    it('should render all privacy toggles', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('privacy-profile-visible')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-show-email')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-show-phone')).toBeInTheDocument();
      expect(screen.getByTestId('privacy-allow-messages')).toBeInTheDocument();
    });

    it('should reflect current privacy settings', () => {
      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      expect(screen.getByTestId('privacy-profile-visible')).toBeChecked();
      expect(screen.getByTestId('privacy-show-email')).not.toBeChecked();
      expect(screen.getByTestId('privacy-show-phone')).not.toBeChecked();
      expect(screen.getByTestId('privacy-allow-messages')).toBeChecked();
    });

    it('should toggle privacy settings', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} />
        </TestWrapper>
      );

      const showEmailToggle = screen.getByTestId('privacy-show-email');
      expect(showEmailToggle).not.toBeChecked();

      await user.click(showEmailToggle);
      expect(showEmailToggle).toBeChecked();
    });
  });

  describe('Save Settings', () => {
    it('should render save button', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('save-settings-button')).toBeInTheDocument();
    });

    it('should call onSave with updated settings', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} onSave={onSave} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('notification-email'));
      await user.click(screen.getByTestId('save-settings-button'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications: expect.objectContaining({
              email: false,
            }),
          })
        );
      });
    });

    it('should show success toast on save', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} onSave={onSave} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('save-settings-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error toast on save failure', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} onSave={onSave} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('save-settings-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should disable button while saving', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <SettingsPage settings={mockSettings} onSave={onSave} />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId('save-settings-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Account Deletion', () => {
    it('should render delete account button', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByTestId('delete-account-button')).toBeInTheDocument();
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('delete-account-button'));

      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();
    });

    it('should show warning message in confirmation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('delete-account-button'));

      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });

    it('should call onDeleteAccount when confirmed', async () => {
      const user = userEvent.setup();
      const onDeleteAccount = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <SettingsPage onDeleteAccount={onDeleteAccount} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('delete-account-button'));
      await user.click(screen.getByTestId('confirm-delete-button'));

      await waitFor(() => {
        expect(onDeleteAccount).toHaveBeenCalled();
      });
    });

    it('should hide confirmation when cancelled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('delete-account-button'));
      expect(screen.getByTestId('delete-confirm')).toBeInTheDocument();

      await user.click(screen.getByTestId('cancel-delete-button'));
      expect(screen.queryByTestId('delete-confirm')).not.toBeInTheDocument();
    });

    it('should not call onDeleteAccount when cancelled', async () => {
      const user = userEvent.setup();
      const onDeleteAccount = jest.fn();

      render(
        <TestWrapper>
          <SettingsPage onDeleteAccount={onDeleteAccount} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('delete-account-button'));
      await user.click(screen.getByTestId('cancel-delete-button'));

      expect(onDeleteAccount).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for toggles', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on toggles', () => {
      render(
        <TestWrapper>
          <SettingsPage />
        </TestWrapper>
      );

      const emailToggle = screen.getByTestId('notification-email');
      expect(emailToggle).toHaveAttribute('type', 'checkbox');
    });
  });
});
