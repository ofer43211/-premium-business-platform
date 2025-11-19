/**
 * Dashboard Component
 * Main dashboard page with grid layout and widgets
 */
import React from 'react';
import { DashboardGrid, DashboardGridItem } from './DashboardGrid';
import './Dashboard.css';

export interface DashboardProps {
  /** Dashboard title */
  title?: string;
  /** Dashboard content/widgets */
  children: React.ReactNode;
  /** Number of grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between widgets */
  gap?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function Dashboard({
  title = 'Dashboard',
  children,
  columns = 3,
  gap = 'md',
  isLoading = false,
  className = '',
  'data-testid': testId = 'dashboard',
}: DashboardProps) {
  return (
    <div className={`dashboard ${className}`} data-testid={testId}>
      {title && (
        <header className="dashboard-header" data-testid={`${testId}-header`}>
          <h1 className="dashboard-title" data-testid={`${testId}-title`}>
            {title}
          </h1>
        </header>
      )}

      {isLoading ? (
        <div className="dashboard-loading" data-testid={`${testId}-loading`}>
          <div className="dashboard-spinner" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <DashboardGrid columns={columns} gap={gap} data-testid={`${testId}-grid`}>
          {children}
        </DashboardGrid>
      )}
    </div>
  );
}
