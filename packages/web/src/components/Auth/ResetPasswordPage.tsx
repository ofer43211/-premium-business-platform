/**
 * Reset Password Page
 * Set new password with token from email
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useZodForm } from '../../forms';
import { Form, InputField, SubmitButton } from '../../forms';
import { z } from 'zod';
import { useToast } from '../../toast';
import { Button } from '../Button';
import { passwordSchema } from '@premium-business/shared/schemas';

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export interface ResetPasswordPageProps {
  token?: string;
  onSubmit?: (password: string, token: string) => Promise<void>;
  onBackToLogin?: () => void;
}

export function ResetPasswordPage({
  token,
  onSubmit,
  onBackToLogin,
}: ResetPasswordPageProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const form = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: { password: string }) => {
    if (!token) {
      toast.error('Invalid or expired reset token');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit?.(data.password, token);
      setPasswordReset(true);
      toast.success(t('auth.passwordChanged'));
    } catch (error) {
      toast.error(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    formState: { errors },
  } = form;

  if (passwordReset) {
    return (
      <div className="auth-page" data-testid="reset-password-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-success-icon" data-testid="success-icon">
              ✓
            </div>
            <h1 className="auth-title">{t('auth.passwordChanged')}</h1>
            <p className="auth-subtitle">
              Your password has been successfully reset. You can now log in with your
              new password.
            </p>
          </div>

          {onBackToLogin && (
            <Button
              variant="primary"
              fullWidth
              onClick={onBackToLogin}
              data-testid="go-to-login"
            >
              {t('auth.login')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" data-testid="reset-password-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title" data-testid="reset-password-title">
            {t('auth.resetPassword')}
          </h1>
          <p className="auth-subtitle">Enter your new password below.</p>
        </div>

        <Form form={form} onSubmit={handleSubmit} className="auth-form">
          <InputField
            name="password"
            register={register}
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
            required
            autoComplete="new-password"
            autoFocus
            data-testid="reset-password-password"
          />

          <InputField
            name="confirmPassword"
            register={register}
            label={t('auth.confirmPassword')}
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            required
            autoComplete="new-password"
            data-testid="reset-password-confirm"
          />

          <SubmitButton
            isSubmitting={isLoading}
            fullWidth
            size="lg"
            loadingText={t('common.loading')}
          >
            {t('auth.resetPassword')}
          </SubmitButton>
        </Form>

        {onBackToLogin && (
          <div className="auth-footer">
            <button
              onClick={onBackToLogin}
              className="auth-link"
              data-testid="back-to-login-link"
            >
              ← {t('common.back')} {t('auth.login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
