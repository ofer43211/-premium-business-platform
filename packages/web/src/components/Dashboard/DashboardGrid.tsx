/**
 * DashboardGrid Component
 * Grid layout container for dashboard widgets
 */
import React from 'react';
import './DashboardGrid.css';

export interface DashboardGridProps {
  /** Grid children (widgets/cards) */
  children: React.ReactNode;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between grid items */
  gap?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function DashboardGrid({
  children,
  columns = 3,
  gap = 'md',
  className = '',
  'data-testid': testId = 'dashboard-grid',
}: DashboardGridProps) {
  const gridClasses = [
    'dashboard-grid',
    `dashboard-grid-columns-${columns}`,
    `dashboard-grid-gap-${gap}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClasses} data-testid={testId}>
      {children}
    </div>
  );
}

export interface DashboardGridItemProps {
  /** Item content */
  children: React.ReactNode;
  /** Column span */
  colSpan?: 1 | 2 | 3 | 4;
  /** Row span */
  rowSpan?: 1 | 2 | 3;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function DashboardGridItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
  'data-testid': testId = 'dashboard-grid-item',
}: DashboardGridItemProps) {
  const itemClasses = [
    'dashboard-grid-item',
    `dashboard-grid-item-col-${colSpan}`,
    `dashboard-grid-item-row-${rowSpan}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClasses} data-testid={testId}>
      {children}
    </div>
  );
}
