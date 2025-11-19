/**
 * Skeleton Components
 * Loading state placeholders with animations
 */
import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // Default heights for variants
  if (!height) {
    if (variant === 'text') {
      style.height = '1em';
    } else if (variant === 'circular') {
      style.height = width || '40px';
      style.width = width || '40px';
    }
  }

  return (
    <span
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={style}
      data-testid="skeleton"
      aria-busy="true"
      aria-live="polite"
    />
  );
}

// Text Skeleton - for text lines
interface SkeletonTextProps {
  lines?: number;
  width?: string | number;
  lastLineWidth?: string | number;
  spacing?: string | number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  width = '100%',
  lastLineWidth = '70%',
  spacing = '0.75em',
  className = '',
}: SkeletonTextProps) {
  return (
    <div className={`skeleton-text ${className}`} data-testid="skeleton-text">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : width}
          className="skeleton-text-line"
          style={{ marginBottom: index < lines - 1 ? spacing : 0 } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Avatar Skeleton
interface SkeletonAvatarProps {
  size?: number | string;
  className?: string;
}

export function SkeletonAvatar({ size = 40, className = '' }: SkeletonAvatarProps) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={`skeleton-avatar ${className}`}
      data-testid="skeleton-avatar"
    />
  );
}

// Card Skeleton
interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
  hasImage?: boolean;
  imageHeight?: string | number;
  hasAvatar?: boolean;
  hasActions?: boolean;
  className?: string;
}

export function SkeletonCard({
  width = '100%',
  height,
  hasImage = false,
  imageHeight = 200,
  hasAvatar = false,
  hasActions = false,
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`skeleton-card ${className}`}
      style={{ width }}
      data-testid="skeleton-card"
    >
      {hasImage && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={imageHeight}
          className="skeleton-card-image"
        />
      )}

      <div className="skeleton-card-content" style={{ padding: '16px' }}>
        {hasAvatar && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <SkeletonAvatar size={40} />
            <div style={{ marginLeft: '12px', flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        )}

        <SkeletonText lines={3} />

        {hasActions && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <Skeleton variant="rounded" width={80} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}

// Table Skeleton
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`skeleton-table ${className}`} data-testid="skeleton-table">
      {hasHeader && (
        <div className="skeleton-table-header" style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`header-${i}`}
              variant="text"
              width={`${100 / columns}%`}
              style={{ fontWeight: 'bold' }}
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="skeleton-table-row"
          style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={`${100 / columns}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// List Skeleton
interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasTwoLines?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  hasAvatar = true,
  hasTwoLines = true,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={`skeleton-list ${className}`} data-testid="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="skeleton-list-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          {hasAvatar && <SkeletonAvatar size={40} />}
          <div style={{ marginLeft: hasAvatar ? '12px' : 0, flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            {hasTwoLines && <Skeleton variant="text" width="60%" />}
          </div>
        </div>
      ))}
    </div>
  );
}
