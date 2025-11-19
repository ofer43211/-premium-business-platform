/**
 * TaskCard Component
 * Display and manage tasks/todos
 */
import React, { useState } from 'react';
import { Card } from './Card';
import './TaskCard.css';

export interface Task {
  /** Unique ID */
  id: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Completion status */
  completed: boolean;
  /** Due date */
  dueDate?: string;
  /** Priority level */
  priority?: 'low' | 'medium' | 'high';
  /** Assigned user */
  assignee?: {
    name: string;
    avatar?: string;
  };
}

export interface TaskCardProps {
  /** Card title */
  title?: string;
  /** List of tasks */
  tasks: Task[];
  /** Task toggle handler */
  onToggle?: (taskId: string, completed: boolean) => void;
  /** Task click handler */
  onTaskClick?: (task: Task) => void;
  /** Add task handler */
  onAddTask?: () => void;
  /** Maximum tasks to display */
  maxTasks?: number;
  /** Show completed tasks */
  showCompleted?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Custom className */
  className?: string;
  /** Test ID */
  'data-testid'?: string;
}

export function TaskCard({
  title = 'Tasks',
  tasks,
  onToggle,
  onTaskClick,
  onAddTask,
  maxTasks = 10,
  showCompleted = true,
  isLoading = false,
  emptyMessage = 'No tasks',
  className = '',
  'data-testid': testId = 'task-card',
}: TaskCardProps) {
  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter((task) => !task.completed);

  const displayedTasks = filteredTasks.slice(0, maxTasks);
  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;

  return (
    <Card
      title={title}
      subtitle={
        totalCount > 0
          ? `${completedCount} of ${totalCount} completed`
          : undefined
      }
      variant="bordered"
      padding="none"
      isLoading={isLoading}
      className={className}
      data-testid={testId}
      headerActions={
        onAddTask ? (
          <button
            className="task-card-add-button"
            onClick={onAddTask}
            data-testid={`${testId}-add-button`}
            aria-label="Add task"
          >
            + Add Task
          </button>
        ) : undefined
      }
    >
      {displayedTasks.length === 0 ? (
        <div className="task-card-empty" data-testid={`${testId}-empty`}>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className="task-list" data-testid={`${testId}-list`}>
          {displayedTasks.map((task, index) => (
            <TaskListItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onClick={onTaskClick}
              data-testid={`${testId}-item-${index}`}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

interface TaskListItemProps {
  task: Task;
  onToggle?: (taskId: string, completed: boolean) => void;
  onClick?: (task: Task) => void;
  'data-testid'?: string;
}

function TaskListItem({
  task,
  onToggle,
  onClick,
  'data-testid': testId,
}: TaskListItemProps) {
  const itemClasses = [
    'task-item',
    task.completed && 'task-item-completed',
    task.priority && `task-item-priority-${task.priority}`,
    onClick && 'task-item-clickable',
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onToggle) {
      onToggle(task.id, e.target.checked);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      // Prevent if checkbox is focused
      if ((e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onClick(task);
      }
    }
  };

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <li
      className={itemClasses}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
    >
      <div className="task-item-checkbox-container">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="task-item-checkbox"
          data-testid={`${testId}-checkbox`}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      <div className="task-item-content">
        <div className="task-item-header">
          <h4 className="task-item-title" data-testid={`${testId}-title`}>
            {task.title}
          </h4>

          {task.priority && (
            <span
              className={`task-item-priority-badge task-item-priority-badge-${task.priority}`}
              data-testid={`${testId}-priority`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="task-item-description" data-testid={`${testId}-description`}>
            {task.description}
          </p>
        )}

        <div className="task-item-meta">
          {task.dueDate && (
            <time
              className={`task-item-due-date ${isOverdue ? 'task-item-overdue' : ''}`}
              data-testid={`${testId}-due-date`}
            >
              {isOverdue && '⚠️ '}
              Due: {task.dueDate}
            </time>
          )}

          {task.assignee && (
            <div className="task-item-assignee" data-testid={`${testId}-assignee`}>
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="task-item-assignee-avatar"
                />
              ) : (
                <span className="task-item-assignee-initial">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="task-item-assignee-name">{task.assignee.name}</span>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
