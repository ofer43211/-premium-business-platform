/**
 * ProfilePage Component
 * User profile view and editing
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useZodForm } from '../../forms';
import { Form, InputField, SubmitButton } from '../../forms';
import { z } from 'zod';
import { useToast } from '../../toast';
import { Card } from '../Dashboard';
import { Button } from '../Button';
import './ProfilePage.css';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  company?: string;
  position?: string;
  website?: string;
  avatar?: string;
}

export interface ProfilePageProps {
  /** Current user profile */
  profile?: UserProfile;
  /** Save profile handler */
  onSave?: (profile: UserProfile) => Promise<void>;
  /** Avatar upload handler */
  onAvatarUpload?: (file: File) => Promise<string>;
  /** Avatar remove handler */
  onAvatarRemove?: () => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

export function ProfilePage({
  profile,
  onSave,
  onAvatarUpload,
  onAvatarRemove,
  isLoading = false,
  className = '',
}: ProfilePageProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar);

  const form = useZodForm({
    schema: profileSchema,
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      company: profile?.company || '',
      position: profile?.position || '',
      website: profile?.website || '',
    },
  });

  const handleSubmit = async (data: UserProfile) => {
    setIsSaving(true);
    try {
      await onSave?.(data);
      toast.success(t('profile.saveSuccess'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const url = await onAvatarUpload?.(file);
      if (url) {
        setAvatarUrl(url);
        toast.success(t('profile.avatarUploadSuccess'));
      }
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true);
    try {
      await onAvatarRemove?.();
      setAvatarUrl(undefined);
      toast.success(t('profile.avatarRemoveSuccess'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const {
    register,
    formState: { errors },
  } = form;

  const getInitials = () => {
    const firstName = profile?.firstName || '';
    const lastName = profile?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`profile-page ${className}`} data-testid="profile-page">
      <div className="profile-page-header">
        <h1 className="profile-page-title" data-testid="profile-title">
          {t('profile.title')}
        </h1>
        <p className="profile-page-subtitle">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="profile-page-content">
        {/* Avatar Section */}
        <Card
          title="Profile Photo"
          variant="bordered"
          padding="lg"
          className="profile-avatar-card"
          data-testid="profile-avatar-card"
        >
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="profile-avatar"
                  data-testid="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder" data-testid="profile-avatar-placeholder">
                  {getInitials()}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="profile-avatar-loading" data-testid="profile-avatar-loading">
                  <div className="spinner" />
                </div>
              )}
            </div>

            <div className="profile-avatar-actions">
              <label htmlFor="avatar-upload" className="profile-avatar-upload-label">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploadingAvatar}
                  as="span"
                  data-testid="upload-avatar-button"
                >
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="profile-avatar-input"
                data-testid="avatar-input"
              />

              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAvatarRemove}
                  disabled={isUploadingAvatar}
                  data-testid="remove-avatar-button"
                >
                  Remove
                </Button>
              )}
            </div>

            <p className="profile-avatar-hint">
              JPG, PNG or GIF. Max size 5MB
            </p>
          </div>
        </Card>

        {/* Profile Information */}
        <Card
          title="Personal Information"
          variant="bordered"
          padding="lg"
          className="profile-info-card"
          data-testid="profile-info-card"
        >
          <Form form={form} onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-row">
              <InputField
                name="firstName"
                register={register}
                label={t('profile.firstName')}
                error={errors.firstName?.message}
                required
                autoComplete="given-name"
                data-testid="profile-firstname"
              />

              <InputField
                name="lastName"
                register={register}
                label={t('profile.lastName')}
                error={errors.lastName?.message}
                required
                autoComplete="family-name"
                data-testid="profile-lastname"
              />
            </div>

            <InputField
              name="email"
              register={register}
              label={t('profile.email')}
              type="email"
              error={errors.email?.message}
              required
              autoComplete="email"
              data-testid="profile-email"
            />

            <InputField
              name="phone"
              register={register}
              label={t('profile.phone')}
              type="tel"
              error={errors.phone?.message}
              autoComplete="tel"
              data-testid="profile-phone"
            />

            <div className="profile-form-group">
              <label htmlFor="bio" className="profile-form-label">
                Bio
              </label>
              <textarea
                id="bio"
                {...register('bio')}
                className="profile-form-textarea"
                rows={4}
                placeholder="Tell us about yourself..."
                data-testid="profile-bio"
              />
              {errors.bio && (
                <p className="profile-form-error">{errors.bio.message}</p>
              )}
            </div>

            <div className="profile-form-row">
              <InputField
                name="company"
                register={register}
                label="Company"
                error={errors.company?.message}
                autoComplete="organization"
                data-testid="profile-company"
              />

              <InputField
                name="position"
                register={register}
                label="Position"
                error={errors.position?.message}
                autoComplete="organization-title"
                data-testid="profile-position"
              />
            </div>

            <InputField
              name="website"
              register={register}
              label="Website"
              type="url"
              error={errors.website?.message}
              autoComplete="url"
              placeholder="https://example.com"
              data-testid="profile-website"
            />

            <div className="profile-form-actions">
              <SubmitButton
                isSubmitting={isSaving}
                loadingText="Saving..."
                data-testid="save-profile-button"
              >
                Save Changes
              </SubmitButton>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
