/**
 * Button Component
 * Flexible button with multiple variants, sizes, and states
 */
import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Loading state */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon before text */
  leftIcon?: React.ReactNode;
  /** Icon after text */
  rightIcon?: React.ReactNode;
  /** Only show icon (no text) */
  iconOnly?: boolean;
  /** Loading text to display */
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      loadingText,
      children,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const buttonClasses = [
      'button',
      `button-${variant}`,
      `button-${size}`,
      fullWidth && 'button-full-width',
      isLoading && 'button-loading',
      iconOnly && 'button-icon-only',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {isLoading && (
          <span className="button-spinner" data-testid="button-spinner" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="button-spinner-icon"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="28"
                strokeDashoffset="28"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="28;0"
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0 8 8;360 8 8"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </span>
        )}

        {!isLoading && leftIcon && (
          <span className="button-icon button-icon-left" data-testid="button-left-icon">
            {leftIcon}
          </span>
        )}

        {!iconOnly && (
          <span className="button-text">
            {isLoading && loadingText ? loadingText : children}
          </span>
        )}

        {!isLoading && rightIcon && (
          <span className="button-icon button-icon-right" data-testid="button-right-icon">
            {rightIcon}
          </span>
        )}

        {iconOnly && !isLoading && children}
      </>
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={buttonClasses}
        aria-busy={isLoading}
        data-testid="button"
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
