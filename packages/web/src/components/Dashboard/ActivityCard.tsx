/**
 * ActivityCard Component
 * Display recent activity feed
 */
import React from 'react';
import { Card } from './Card';
import './ActivityCard.css';

export interface ActivityItem {
  /** Unique ID */
  id: string;
  /** Activity title */
  title: string;
  /** Activity description */
  description?: string;
  /** Timestamp */
  timestamp: string;
  /** User who performed the action */
  user?: {
    name: string;
    avatar?: string;
  };
  /** Activity type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Icon */
  icon?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

export interface ActivityCardProps {
  /** Card title */
  title?: string;
  /** List of activities */
  activities: ActivityItem[];
  /** Maximum items to display */
  maxItems?: number;
  /** Show "View All" link */
  showViewAll?: boolean;
  /** View all click handler */
  onViewAll?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function ActivityCard({
  title = 'Recent Activity',
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  isLoading = false,
  emptyMessage = 'No recent activity',
  className = '',
  'data-testid': testId = 'activity-card',
}: ActivityCardProps) {
  const displayedActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  return (
    <Card
      title={title}
      variant="bordered"
      padding="none"
      isLoading={isLoading}
      className={className}
      data-testid={testId}
      footer={
        showViewAll && (hasMore || onViewAll) ? (
          <button
            className="activity-card-view-all"
            onClick={onViewAll}
            data-testid={`${testId}-view-all`}
          >
            View All {hasMore && `(${activities.length})`}
          </button>
        ) : undefined
      }
    >
      {displayedActivities.length === 0 ? (
        <div className="activity-card-empty" data-testid={`${testId}-empty`}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="activity-list" data-testid={`${testId}-list`}>
          {displayedActivities.map((activity, index) => (
            <ActivityListItem
              key={activity.id}
              activity={activity}
              data-testid={`${testId}-item-${index}`}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

interface ActivityListItemProps {
  activity: ActivityItem;
  'data-testid'?: string;
}

function ActivityListItem({
  activity,
  'data-testid': testId,
}: ActivityListItemProps) {
  const itemClasses = [
    'activity-item',
    activity.type && `activity-item-${activity.type}`,
    activity.onClick && 'activity-item-clickable',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (activity.onClick) {
      activity.onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activity.onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      activity.onClick();
    }
  };

  return (
    <li
      className={itemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={activity.onClick ? 'button' : undefined}
      tabIndex={activity.onClick ? 0 : undefined}
      data-testid={testId}
    >
      {(activity.icon || activity.user?.avatar) && (
        <div className="activity-item-icon" data-testid={`${testId}-icon`}>
          {activity.icon || (
            <img
              src={activity.user!.avatar}
              alt={activity.user!.name}
              className="activity-item-avatar"
            />
          )}
        </div>
      )}

      <div className="activity-item-content">
        <div className="activity-item-header">
          <h4 className="activity-item-title" data-testid={`${testId}-title`}>
            {activity.title}
          </h4>
          <time className="activity-item-timestamp" data-testid={`${testId}-timestamp`}>
            {activity.timestamp}
          </time>
        </div>

        {activity.description && (
          <p className="activity-item-description" data-testid={`${testId}-description`}>
            {activity.description}
          </p>
        )}

        {activity.user && (
          <p className="activity-item-user" data-testid={`${testId}-user`}>
            {activity.user.name}
          </p>
        )}
      </div>
    </li>
  );
}
