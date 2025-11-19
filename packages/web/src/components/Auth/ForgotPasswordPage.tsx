/**
 * Forgot Password Page
 * Request password reset email
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useZodForm } from '../../forms';
import { Form, InputField, SubmitButton } from '../../forms';
import { z } from 'zod';
import { useToast } from '../../toast';
import { Button } from '../Button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export interface ForgotPasswordPageProps {
  onSubmit?: (email: string) => Promise<void>;
  onBackToLogin?: () => void;
}

export function ForgotPasswordPage({
  onSubmit,
  onBackToLogin,
}: ForgotPasswordPageProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await onSubmit?.(data.email);
      setEmailSent(true);
      toast.success(t('auth.passwordResetSent'));
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

  if (emailSent) {
    return (
      <div className="auth-page" data-testid="forgot-password-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="auth-success-icon" data-testid="success-icon">
              ✓
            </div>
            <h1 className="auth-title">{t('auth.passwordResetSent')}</h1>
            <p className="auth-subtitle">
              Check your email for instructions to reset your password.
            </p>
          </div>

          {onBackToLogin && (
            <Button
              variant="outline"
              fullWidth
              onClick={onBackToLogin}
              data-testid="back-to-login"
            >
              {t('common.back')} {t('auth.login')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" data-testid="forgot-password-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title" data-testid="forgot-password-title">
            {t('auth.forgotPassword')}
          </h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        <Form form={form} onSubmit={handleSubmit} className="auth-form">
          <InputField
            name="email"
            register={register}
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            autoComplete="email"
            autoFocus
            data-testid="forgot-password-email"
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
