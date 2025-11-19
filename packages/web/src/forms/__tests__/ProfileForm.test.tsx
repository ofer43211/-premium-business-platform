/**
 * Tests for ProfileForm Example
 * Coverage: Complex form with RTL support, multiple field types
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '../examples/ProfileForm';

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('profile-form')).toBeInTheDocument();
      expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
      expect(screen.getByTestId('bio-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
      expect(screen.getByTestId('timezone-select')).toBeInTheDocument();
      expect(screen.getByTestId('theme-radio-group')).toBeInTheDocument();
    });

    it('should render with default values', () => {
      const defaultValues = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer',
        language: 'en' as const,
        theme: 'dark' as const,
        timezone: 'America/New_York',
      };

      render(<ProfileForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />);

      const firstNameInput = screen.getByTestId('first-name-input') as HTMLInputElement;
      const lastNameInput = screen.getByTestId('last-name-input') as HTMLInputElement;
      const bioTextarea = screen.getByTestId('bio-textarea') as HTMLTextAreaElement;

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(bioTextarea.value).toBe('Software developer');
    });

    it('should render language options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('עברית')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });

    it('should render timezone options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('UTC')).toBeInTheDocument();
      expect(screen.getByText('Eastern Time (US)')).toBeInTheDocument();
      expect(screen.getByText('Jerusalem')).toBeInTheDocument();
    });

    it('should render theme radio options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('Light Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Dark Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto (System)')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should apply LTR direction for English', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} currentLanguage="en" />);

      const firstNameInput = screen.getByTestId('first-name-input');
      expect(firstNameInput).toHaveAttribute('dir', 'ltr');
    });

    it('should apply RTL direction for Hebrew', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} currentLanguage="he" />);

      const firstNameInput = screen.getByTestId('first-name-input');
      expect(firstNameInput).toHaveAttribute('dir', 'rtl');
    });

    it('should apply RTL direction for Arabic', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} currentLanguage="ar" />);

      const firstNameInput = screen.getByTestId('first-name-input');
      const bioTextarea = screen.getByTestId('bio-textarea');

      expect(firstNameInput).toHaveAttribute('dir', 'rtl');
      expect(bioTextarea).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Form Validation', () => {
    it('should show error for short first name', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByTestId('first-name-input');
      const submitButton = screen.getByText('Save Profile');

      await user.type(firstNameInput, 'J');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('First name must be at least 2 characters')
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for short last name', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const lastNameInput = screen.getByTestId('last-name-input');
      const submitButton = screen.getByText('Save Profile');

      await user.type(lastNameInput, 'D');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Last name must be at least 2 characters')
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for bio exceeding max length', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const bioTextarea = screen.getByTestId('bio-textarea');
      const submitButton = screen.getByText('Save Profile');

      const longBio = 'a'.repeat(501);
      await user.type(bioTextarea, longBio);
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Bio must be at most 500 characters')
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should accept valid bio within max length', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');
      const bioTextarea = screen.getByTestId('bio-textarea');
      const languageSelect = screen.getByTestId('language-select');
      const timezoneSelect = screen.getByTestId('timezone-select');
      const submitButton = screen.getByText('Save Profile');

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(bioTextarea, 'Valid bio text');
      await user.selectOptions(languageSelect, 'en');
      await user.selectOptions(timezoneSelect, 'UTC');
      await user.click(screen.getByLabelText('Light Theme'));
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('should show error for missing timezone', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByTestId('first-name-input');
      const lastNameInput = screen.getByTestId('last-name-input');
      const languageSelect = screen.getByTestId('language-select');
      const submitButton = screen.getByText('Save Profile');

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.selectOptions(languageSelect, 'en');
      await user.click(screen.getByLabelText('Light Theme'));
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a timezone')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Field Interactions', () => {
    it('should update first name field', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const firstNameInput = screen.getByTestId(
        'first-name-input'
      ) as HTMLInputElement;

      await user.type(firstNameInput, 'Jane');

      expect(firstNameInput.value).toBe('Jane');
    });

    it('should update bio textarea', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const bioTextarea = screen.getByTestId('bio-textarea') as HTMLTextAreaElement;

      await user.type(bioTextarea, 'I am a developer');

      expect(bioTextarea.value).toBe('I am a developer');
    });

    it('should select language', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const languageSelect = screen.getByTestId(
        'language-select'
      ) as HTMLSelectElement;

      await user.selectOptions(languageSelect, 'he');

      expect(languageSelect.value).toBe('he');
    });

    it('should select timezone', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const timezoneSelect = screen.getByTestId(
        'timezone-select'
      ) as HTMLSelectElement;

      await user.selectOptions(timezoneSelect, 'Asia/Jerusalem');

      expect(timezoneSelect.value).toBe('Asia/Jerusalem');
    });

    it('should select theme radio', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const darkThemeRadio = screen.getByLabelText('Dark Theme') as HTMLInputElement;

      await user.click(darkThemeRadio);

      expect(darkThemeRadio.checked).toBe(true);
    });

    it('should switch between theme options', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      const lightThemeRadio = screen.getByLabelText('Light Theme') as HTMLInputElement;
      const darkThemeRadio = screen.getByLabelText('Dark Theme') as HTMLInputElement;

      await user.click(lightThemeRadio);
      expect(lightThemeRadio.checked).toBe(true);

      await user.click(darkThemeRadio);
      expect(darkThemeRadio.checked).toBe(true);
      expect(lightThemeRadio.checked).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should submit with valid data', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');
      await user.type(screen.getByTestId('bio-textarea'), 'Developer');
      await user.selectOptions(screen.getByTestId('language-select'), 'en');
      await user.selectOptions(screen.getByTestId('timezone-select'), 'UTC');
      await user.click(screen.getByLabelText('Light Theme'));
      await user.click(screen.getByText('Save Profile'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Developer',
            language: 'en',
            timezone: 'UTC',
            theme: 'light',
          })
        );
      });
    });

    it('should submit without optional bio', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');
      await user.selectOptions(screen.getByTestId('language-select'), 'en');
      await user.selectOptions(screen.getByTestId('timezone-select'), 'UTC');
      await user.click(screen.getByLabelText('Dark Theme'));
      await user.click(screen.getByText('Save Profile'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            bio: '',
            language: 'en',
            timezone: 'UTC',
            theme: 'dark',
          })
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const slowSubmit = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ProfileForm onSubmit={slowSubmit} />);

      await user.type(screen.getByTestId('first-name-input'), 'John');
      await user.type(screen.getByTestId('last-name-input'), 'Doe');
      await user.selectOptions(screen.getByTestId('language-select'), 'en');
      await user.selectOptions(screen.getByTestId('timezone-select'), 'UTC');
      await user.click(screen.getByLabelText('Light Theme'));
      await user.click(screen.getByText('Save Profile'));

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Save Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Helper Text', () => {
    it('should show bio character limit helper text', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should mark required fields', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      // All fields are required
      expect(screen.getAllByText('*').length).toBeGreaterThan(0);
    });

    it('should have proper labels for all fields', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByLabelText('Preferred Language')).toBeInTheDocument();
      expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
      expect(screen.getByText('Theme Preference')).toBeInTheDocument();
    });

    it('should have radiogroup role for theme options', () => {
      render(<ProfileForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });
  });

  describe('Multi-language Support', () => {
    it('should work with Hebrew language selection', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} currentLanguage="he" />);

      const languageSelect = screen.getByTestId('language-select');

      await user.selectOptions(languageSelect, 'he');

      expect((languageSelect as HTMLSelectElement).value).toBe('he');
    });

    it('should work with Arabic language selection', async () => {
      const user = userEvent.setup();
      render(<ProfileForm onSubmit={mockOnSubmit} currentLanguage="ar" />);

      const languageSelect = screen.getByTestId('language-select');

      await user.selectOptions(languageSelect, 'ar');

      expect((languageSelect as HTMLSelectElement).value).toBe('ar');
    });
  });
});
