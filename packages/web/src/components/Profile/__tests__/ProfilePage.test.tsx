/**
 * Tests for ProfilePage Component
 * Coverage: Profile editing, avatar upload, form validation
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ToastProvider } from '../../../toast';
import { ProfilePage, UserProfile } from '../ProfilePage';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ToastProvider>{children}</ToastProvider>
    </I18nextProvider>
  );
}

const mockProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  bio: 'Software developer',
  company: 'Acme Inc',
  position: 'Senior Developer',
  website: 'https://johndoe.com',
  avatar: 'https://example.com/avatar.jpg',
};

describe('ProfilePage', () => {
  describe('Rendering', () => {
    it('should render profile page', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );
      expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    it('should render title', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );
      expect(screen.getByTestId('profile-title')).toBeInTheDocument();
    });

    it('should render avatar card', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );
      expect(screen.getByTestId('profile-avatar-card')).toBeInTheDocument();
    });

    it('should render info card', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );
      expect(screen.getByTestId('profile-info-card')).toBeInTheDocument();
    });
  });

  describe('Profile Data', () => {
    it('should populate form with profile data', () => {
      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} />
        </TestWrapper>
      );

      expect(screen.getByTestId('profile-firstname')).toHaveValue('John');
      expect(screen.getByTestId('profile-lastname')).toHaveValue('Doe');
      expect(screen.getByTestId('profile-email')).toHaveValue('john@example.com');
      expect(screen.getByTestId('profile-phone')).toHaveValue('+1234567890');
      expect(screen.getByTestId('profile-bio')).toHaveValue('Software developer');
      expect(screen.getByTestId('profile-company')).toHaveValue('Acme Inc');
      expect(screen.getByTestId('profile-position')).toHaveValue('Senior Developer');
      expect(screen.getByTestId('profile-website')).toHaveValue('https://johndoe.com');
    });

    it('should show avatar when provided', () => {
      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} />
        </TestWrapper>
      );

      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should show initials when no avatar', () => {
      const profileWithoutAvatar = { ...mockProfile, avatar: undefined };

      render(
        <TestWrapper>
          <ProfilePage profile={profileWithoutAvatar} />
        </TestWrapper>
      );

      expect(screen.getByTestId('profile-avatar-placeholder')).toHaveTextContent('JD');
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with updated data', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} onSave={onSave} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByTestId('profile-firstname');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'john@example.com',
          })
        );
      });
    });

    it('should show success toast on save', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} onSave={onSave} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should show error toast on save failure', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));

      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} onSave={onSave} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('save-profile-button'));

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
          <ProfilePage profile={mockProfile} onSave={onSave} />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId('save-profile-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const emailInput = screen.getByTestId('profile-email');
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty first name', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} />
        </TestWrapper>
      );

      const firstNameInput = screen.getByTestId('profile-firstname');
      await user.clear(firstNameInput);
      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid website', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const websiteInput = screen.getByTestId('profile-website');
      await user.type(websiteInput, 'not-a-url');
      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
      });
    });

    it('should allow empty optional fields', async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ProfilePage onSave={onSave} />
        </TestWrapper>
      );

      await user.type(screen.getByTestId('profile-firstname'), 'John');
      await user.type(screen.getByTestId('profile-lastname'), 'Doe');
      await user.type(screen.getByTestId('profile-email'), 'john@example.com');

      await user.click(screen.getByTestId('save-profile-button'));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });
  });

  describe('Avatar Upload', () => {
    it('should show upload button', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('upload-avatar-button')).toBeInTheDocument();
    });

    it('should show remove button when avatar exists', () => {
      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} />
        </TestWrapper>
      );

      expect(screen.getByTestId('remove-avatar-button')).toBeInTheDocument();
    });

    it('should not show remove button when no avatar', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.queryByTestId('remove-avatar-button')).not.toBeInTheDocument();
    });

    it('should call onAvatarUpload when file is selected', async () => {
      const user = userEvent.setup();
      const onAvatarUpload = jest.fn().mockResolvedValue('https://example.com/new-avatar.jpg');

      render(
        <TestWrapper>
          <ProfilePage onAvatarUpload={onAvatarUpload} />
        </TestWrapper>
      );

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const input = screen.getByTestId('avatar-input');

      await user.upload(input, file);

      await waitFor(() => {
        expect(onAvatarUpload).toHaveBeenCalled();
      });
    });

    it('should show loading state while uploading', async () => {
      const user = userEvent.setup();
      const onAvatarUpload = jest.fn(
        () => new Promise((resolve) => setTimeout(() => resolve('url'), 100))
      );

      render(
        <TestWrapper>
          <ProfilePage onAvatarUpload={onAvatarUpload} />
        </TestWrapper>
      );

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
      const input = screen.getByTestId('avatar-input');

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByTestId('profile-avatar-loading')).toBeInTheDocument();
      });
    });

    it('should call onAvatarRemove when remove is clicked', async () => {
      const user = userEvent.setup();
      const onAvatarRemove = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ProfilePage profile={mockProfile} onAvatarRemove={onAvatarRemove} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('remove-avatar-button'));

      await waitFor(() => {
        expect(onAvatarRemove).toHaveBeenCalled();
      });
    });

    it('should reject non-image files', async () => {
      const user = userEvent.setup();
      const onAvatarUpload = jest.fn();

      render(
        <TestWrapper>
          <ProfilePage onAvatarUpload={onAvatarUpload} />
        </TestWrapper>
      );

      const file = new File(['text'], 'file.txt', { type: 'text/plain' });
      const input = screen.getByTestId('avatar-input');

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(onAvatarUpload).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should have proper autocomplete attributes', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByTestId('profile-firstname')).toHaveAttribute('autocomplete', 'given-name');
      expect(screen.getByTestId('profile-lastname')).toHaveAttribute('autocomplete', 'family-name');
      expect(screen.getByTestId('profile-email')).toHaveAttribute('autocomplete', 'email');
    });
  });
});
