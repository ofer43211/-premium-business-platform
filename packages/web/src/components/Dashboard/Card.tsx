/**
 * Card Component
 * Base card component for Dashboard widgets
 */
import React from 'react';
import './Card.css';

export interface CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle or description */
  subtitle?: string;
  /** Card content */
  children: React.ReactNode;
  /** Header actions (buttons, menu, etc.) */
  headerActions?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Make card clickable */
  onClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function Card({
  title,
  subtitle,
  children,
  headerActions,
  footer,
  variant = 'default',
  padding = 'md',
  onClick,
  isLoading = false,
  className = '',
  'data-testid': testId = 'card',
}: CardProps) {
  const cardClasses = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    onClick && 'card-clickable',
    isLoading && 'card-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
    >
      {(title || subtitle || headerActions) && (
        <div className="card-header" data-testid={`${testId}-header`}>
          <div className="card-header-content">
            {title && (
              <h3 className="card-title" data-testid={`${testId}-title`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="card-subtitle" data-testid={`${testId}-subtitle`}>
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="card-header-actions" data-testid={`${testId}-actions`}>
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className="card-body" data-testid={`${testId}-body`}>
        {isLoading ? (
          <div className="card-loading-state" data-testid={`${testId}-loading`}>
            <div className="card-spinner" />
            <p>Loading...</p>
          </div>
        ) : (
          children
        )}
      </div>

      {footer && (
        <div className="card-footer" data-testid={`${testId}-footer`}>
          {footer}
        </div>
      )}
    </div>
  );
}
