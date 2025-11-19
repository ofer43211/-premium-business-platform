/**
 * Login Page
 * Complete login page with form validation
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useZodForm } from '../../forms';
import { Form, InputField, SubmitButton, FormErrorSummary } from '../../forms';
import { Button } from '../Button';
import { loginSchema } from '@premium-business/shared/schemas';
import { useToast } from '../../toast';

export interface LoginPageProps {
  onLogin?: (data: { email: string; password: string }) => Promise<void>;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

export function LoginPage({ onLogin, onForgotPassword, onSignup }: LoginPageProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await onLogin?.(data);
      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      toast.error(t('auth.errors.invalidCredentials'));
      form.setError('root', { message: t('auth.errors.invalidCredentials') });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="auth-page" data-testid="login-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title" data-testid="login-title">
            {t('auth.login')}
          </h1>
          <p className="auth-subtitle">{t('common.welcome')}</p>
        </div>

        <Form form={form} onSubmit={handleSubmit} className="auth-form">
          <FormErrorSummary errors={errors} />

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
            data-testid="login-email"
          />

          <InputField
            name="password"
            register={register}
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            autoComplete="current-password"
            data-testid="login-password"
          />

          <div className="auth-options">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                {...register('rememberMe')}
                data-testid="login-remember"
              />
              <span>{t('auth.rememberMe')}</span>
            </label>

            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="auth-link"
                data-testid="forgot-password-link"
              >
                {t('auth.forgotPassword')}
              </button>
            )}
          </div>

          <SubmitButton
            isSubmitting={isLoading}
            fullWidth
            size="lg"
            loadingText={t('common.loading')}
          >
            {t('auth.login')}
          </SubmitButton>
        </Form>

        {onSignup && (
          <div className="auth-footer">
            <p className="auth-footer-text">
              {t('auth.dontHaveAccount')}{' '}
              <button
                onClick={onSignup}
                className="auth-link"
                data-testid="signup-link"
              >
                {t('auth.signup')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
