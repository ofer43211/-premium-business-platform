/**
 * SettingsPage Component
 * User settings and preferences
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useTheme } from '../../theme';
import { useToast } from '../../toast';
import { Card } from '../Dashboard';
import { Button } from '../Button';
import './SettingsPage.css';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

export interface SettingsPageProps {
  /** Current settings */
  settings?: UserSettings;
  /** Save settings handler */
  onSave?: (settings: UserSettings) => Promise<void>;
  /** Delete account handler */
  onDeleteAccount?: () => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
}

export function SettingsPage({
  settings,
  onSave,
  onDeleteAccount,
  isLoading = false,
  className = '',
}: SettingsPageProps) {
  const { t, changeLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [localSettings, setLocalSettings] = useState<UserSettings>(
    settings || {
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
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationChange = (key: keyof UserSettings['notifications']) => {
    setLocalSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy']) => {
    setLocalSettings((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key],
      },
    }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    setLocalSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: newTheme,
      },
    }));
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang as any);
    setLocalSettings((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language: lang,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(localSettings);
      toast.success(t('settings.saveSuccess'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await onDeleteAccount?.();
      toast.success(t('settings.accountDeleted'));
    } catch (error) {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <div className={`settings-page ${className}`} data-testid="settings-page">
      <div className="settings-page-header">
        <h1 className="settings-page-title" data-testid="settings-title">
          {t('settings.title')}
        </h1>
        <p className="settings-page-subtitle">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="settings-page-content">
        {/* Appearance Settings */}
        <Card
          title="Appearance"
          subtitle="Customize how the app looks and feels"
          variant="bordered"
          padding="lg"
          data-testid="appearance-settings"
        >
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4 className="settings-item-title">Theme</h4>
                <p className="settings-item-description">
                  Choose your preferred color scheme
                </p>
              </div>
              <div className="settings-theme-buttons">
                <Button
                  variant={localSettings.preferences.theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                  data-testid="theme-light"
                >
                  Light
                </Button>
                <Button
                  variant={localSettings.preferences.theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                  data-testid="theme-dark"
                >
                  Dark
                </Button>
                <Button
                  variant={localSettings.preferences.theme === 'auto' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange('auto')}
                  data-testid="theme-auto"
                >
                  Auto
                </Button>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <h4 className="settings-item-title">Language</h4>
                <p className="settings-item-description">
                  Select your preferred language
                </p>
              </div>
              <select
                value={localSettings.preferences.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="settings-select"
                data-testid="language-select"
              >
                <option value="en">English</option>
                <option value="he">עברית (Hebrew)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card
          title="Notifications"
          subtitle="Choose how you want to be notified"
          variant="bordered"
          padding="lg"
          data-testid="notification-settings"
        >
          <div className="settings-section">
            <SettingsToggle
              label="Email Notifications"
              description="Receive notifications via email"
              checked={localSettings.notifications.email}
              onChange={() => handleNotificationChange('email')}
              data-testid="notification-email"
            />

            <SettingsToggle
              label="Push Notifications"
              description="Receive push notifications in your browser"
              checked={localSettings.notifications.push}
              onChange={() => handleNotificationChange('push')}
              data-testid="notification-push"
            />

            <SettingsToggle
              label="SMS Notifications"
              description="Receive notifications via SMS"
              checked={localSettings.notifications.sms}
              onChange={() => handleNotificationChange('sms')}
              data-testid="notification-sms"
            />

            <SettingsToggle
              label="Marketing Emails"
              description="Receive marketing and promotional emails"
              checked={localSettings.notifications.marketing}
              onChange={() => handleNotificationChange('marketing')}
              data-testid="notification-marketing"
            />
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card
          title="Privacy"
          subtitle="Control your privacy and data sharing"
          variant="bordered"
          padding="lg"
          data-testid="privacy-settings"
        >
          <div className="settings-section">
            <SettingsToggle
              label="Public Profile"
              description="Make your profile visible to other users"
              checked={localSettings.privacy.profileVisible}
              onChange={() => handlePrivacyChange('profileVisible')}
              data-testid="privacy-profile-visible"
            />

            <SettingsToggle
              label="Show Email"
              description="Display your email address on your profile"
              checked={localSettings.privacy.showEmail}
              onChange={() => handlePrivacyChange('showEmail')}
              data-testid="privacy-show-email"
            />

            <SettingsToggle
              label="Show Phone"
              description="Display your phone number on your profile"
              checked={localSettings.privacy.showPhone}
              onChange={() => handlePrivacyChange('showPhone')}
              data-testid="privacy-show-phone"
            />

            <SettingsToggle
              label="Allow Messages"
              description="Allow other users to send you messages"
              checked={localSettings.privacy.allowMessages}
              onChange={() => handlePrivacyChange('allowMessages')}
              data-testid="privacy-allow-messages"
            />
          </div>
        </Card>

        {/* Account Management */}
        <Card
          title="Account Management"
          subtitle="Manage your account and data"
          variant="bordered"
          padding="lg"
          data-testid="account-settings"
        >
          <div className="settings-section">
            <div className="settings-item">
              <div className="settings-item-info">
                <h4 className="settings-item-title">Delete Account</h4>
                <p className="settings-item-description">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="delete-account-button"
              >
                Delete Account
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="settings-delete-confirm" data-testid="delete-confirm">
                <p className="settings-delete-warning">
                  ⚠️ This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="settings-delete-actions">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDeleteAccount}
                    data-testid="confirm-delete-button"
                  >
                    Yes, Delete My Account
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    data-testid="cancel-delete-button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Save Actions */}
        <div className="settings-actions">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
            data-testid="save-settings-button"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SettingsToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  'data-testid'?: string;
}

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  'data-testid': testId,
}: SettingsToggleProps) {
  return (
    <div className="settings-item">
      <div className="settings-item-info">
        <h4 className="settings-item-title">{label}</h4>
        <p className="settings-item-description">{description}</p>
      </div>
      <label className="settings-toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="settings-toggle-input"
          data-testid={testId}
        />
        <span className="settings-toggle-slider" />
      </label>
    </div>
  );
}
