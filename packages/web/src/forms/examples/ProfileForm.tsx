/**
 * Example: Profile Form
 * Demonstrates complex form with multiple field types and RTL support
 */
import React from 'react';
import { z } from 'zod';
import { useZodForm } from '../hooks/useZodForm';
import { Form, SubmitButton, FormErrorSummary } from '../components/Form';
import {
  InputField,
  TextareaField,
  SelectField,
  RadioGroupField,
} from '../components/FormField';

// Profile schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  language: z.enum(['en', 'he', 'ar'], {
    errorMap: () => ({ message: 'Please select a language' }),
  }),
  theme: z.enum(['light', 'dark', 'auto']),
  timezone: z.string().min(1, 'Please select a timezone'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  defaultValues?: Partial<ProfileFormData>;
  currentLanguage?: 'en' | 'he' | 'ar';
}

export function ProfileForm({
  onSubmit,
  defaultValues,
  currentLanguage = 'en',
}: ProfileFormProps) {
  const form = useZodForm({
    schema: profileSchema,
    defaultValues: {
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      bio: defaultValues?.bio || '',
      language: defaultValues?.language || 'en',
      theme: defaultValues?.theme || 'light',
      timezone: defaultValues?.timezone || '',
    },
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  // RTL support for Hebrew and Arabic
  const isRTL = currentLanguage === 'he' || currentLanguage === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'he', label: 'עברית' },
    { value: 'ar', label: 'العربية' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Asia/Jerusalem', label: 'Jerusalem' },
    { value: 'Asia/Dubai', label: 'Dubai' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  return (
    <Form form={form} onSubmit={onSubmit} data-testid="profile-form">
      <FormErrorSummary errors={errors} />

      <div className="form-row">
        <InputField
          name="firstName"
          register={register}
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          required
          dir={dir}
          data-testid="first-name-input"
        />

        <InputField
          name="lastName"
          register={register}
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          required
          dir={dir}
          data-testid="last-name-input"
        />
      </div>

      <TextareaField
        name="bio"
        register={register}
        label="Bio"
        placeholder="Tell us about yourself..."
        error={errors.bio?.message}
        helperText="Maximum 500 characters"
        rows={4}
        dir={dir}
        data-testid="bio-textarea"
      />

      <SelectField
        name="language"
        register={register}
        label="Preferred Language"
        options={languageOptions}
        error={errors.language?.message}
        required
        data-testid="language-select"
      />

      <SelectField
        name="timezone"
        register={register}
        label="Timezone"
        options={timezoneOptions}
        placeholder="Select your timezone"
        error={errors.timezone?.message}
        required
        data-testid="timezone-select"
      />

      <RadioGroupField
        name="theme"
        register={register}
        label="Theme Preference"
        options={themeOptions}
        error={errors.theme?.message}
        required
        data-testid="theme-radio-group"
      />

      <SubmitButton isSubmitting={isSubmitting} loadingText="Saving...">
        Save Profile
      </SubmitButton>
    </Form>
  );
}
