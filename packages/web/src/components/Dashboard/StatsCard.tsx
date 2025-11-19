/**
 * StatsCard Component
 * Display key metrics and statistics
 */
import React from 'react';
import { Card } from './Card';
import './StatsCard.css';

export interface StatsCardProps {
  /** Stat title */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Change percentage (can be positive or negative) */
  change?: number;
  /** Change label (e.g., "vs last month") */
  changeLabel?: string;
  /** Icon or visual element */
  icon?: React.ReactNode;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Variant for different visual styles */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Loading state */
  isLoading?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  trend,
  variant = 'default',
  isLoading = false,
  onClick,
  className = '',
  'data-testid': testId = 'stats-card',
}: StatsCardProps) {
  const statsClasses = [
    'stats-card',
    `stats-card-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Auto-determine trend from change if not explicitly provided
  const effectiveTrend = trend || (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  return (
    <Card
      variant="bordered"
      padding="md"
      onClick={onClick}
      isLoading={isLoading}
      className={statsClasses}
      data-testid={testId}
    >
      <div className="stats-card-content">
        {icon && (
          <div className="stats-card-icon" data-testid={`${testId}-icon`}>
            {icon}
          </div>
        )}

        <div className="stats-card-body">
          <p className="stats-card-title" data-testid={`${testId}-title`}>
            {title}
          </p>

          <div className="stats-card-value-container">
            <h2 className="stats-card-value" data-testid={`${testId}-value`}>
              {value}
            </h2>

            {change !== undefined && (
              <div
                className={`stats-card-change stats-card-change-${effectiveTrend}`}
                data-testid={`${testId}-change`}
              >
                <span className="stats-card-change-icon">
                  {effectiveTrend === 'up' && '↑'}
                  {effectiveTrend === 'down' && '↓'}
                  {effectiveTrend === 'neutral' && '→'}
                </span>
                <span className="stats-card-change-value">
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>

          {changeLabel && change !== undefined && (
            <p className="stats-card-change-label" data-testid={`${testId}-change-label`}>
              {changeLabel}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
