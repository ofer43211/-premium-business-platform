/**
 * Signup Page
 * Complete registration page with form validation
 */
import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { useZodForm } from '../../forms';
import { Form, InputField, SubmitButton, FormErrorSummary } from '../../forms';
import { signupSchema } from '@premium-business/shared/schemas';
import { useToast } from '../../toast';

export interface SignupPageProps {
  onSignup?: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  onLogin?: () => void;
}

export function SignupPage({ onSignup, onLogin }: SignupPageProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useZodForm({
    schema: signupSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  const handleSubmit = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    setIsLoading(true);
    try {
      await onSignup?.(data);
      toast.success(t('auth.signupSuccess'));
    } catch (error: any) {
      if (error?.message?.includes('exists')) {
        toast.error(t('auth.errors.emailAlreadyExists'));
        form.setError('email', { message: t('auth.errors.emailAlreadyExists') });
      } else {
        toast.error(t('errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="auth-page" data-testid="signup-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title" data-testid="signup-title">
            {t('auth.signup')}
          </h1>
          <p className="auth-subtitle">{t('common.getStarted')}</p>
        </div>

        <Form form={form} onSubmit={handleSubmit} className="auth-form">
          <FormErrorSummary errors={errors} />

          <div className="form-row">
            <InputField
              name="firstName"
              register={register}
              label={t('profile.firstName')}
              placeholder="John"
              error={errors.firstName?.message}
              required
              autoComplete="given-name"
              autoFocus
              data-testid="signup-firstname"
            />

            <InputField
              name="lastName"
              register={register}
              label={t('profile.lastName')}
              placeholder="Doe"
              error={errors.lastName?.message}
              required
              autoComplete="family-name"
              data-testid="signup-lastname"
            />
          </div>

          <InputField
            name="email"
            register={register}
            label={t('auth.email')}
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            required
            autoComplete="email"
            data-testid="signup-email"
          />

          <InputField
            name="password"
            register={register}
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            helperText={t('validation.minLength', { min: 8 })}
            required
            autoComplete="new-password"
            data-testid="signup-password"
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
            data-testid="signup-confirm-password"
          />

          <SubmitButton
            isSubmitting={isLoading}
            fullWidth
            size="lg"
            loadingText={t('common.loading')}
          >
            {t('auth.signup')}
          </SubmitButton>
        </Form>

        {onLogin && (
          <div className="auth-footer">
            <p className="auth-footer-text">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={onLogin}
                className="auth-link"
                data-testid="login-link"
              >
                {t('auth.login')}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
