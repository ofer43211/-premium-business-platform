/**
 * Button Group Component
 * Group related buttons together
 */
import React from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  /** Orientation of button group */
  orientation?: 'horizontal' | 'vertical';
  /** Attach buttons together */
  attached?: boolean;
  /** Full width group */
  fullWidth?: boolean;
  /** Spacing between buttons */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  attached = false,
  fullWidth = false,
  spacing = 'sm',
  className = '',
}: ButtonGroupProps) {
  const groupClasses = [
    'button-group',
    `button-group-${orientation}`,
    attached && 'button-group-attached',
    fullWidth && 'button-group-full-width',
    !attached && `button-group-spacing-${spacing}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClasses} role="group" data-testid="button-group">
      {children}
    </div>
  );
}
