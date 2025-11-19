/**
 * Tests for TaskCard Component
 * Coverage: Task list, toggle, priority, due dates, assignees
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard, Task } from '../TaskCard';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive docs for the project',
    completed: false,
    dueDate: '2024-12-31',
    priority: 'high',
    assignee: { name: 'John Doe', avatar: 'https://example.com/john.jpg' },
  },
  {
    id: '2',
    title: 'Review pull requests',
    completed: true,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Update dependencies',
    description: 'Update all npm packages to latest versions',
    completed: false,
    dueDate: '2023-01-01', // Overdue
    priority: 'low',
    assignee: { name: 'Jane Smith' },
  },
];

describe('TaskCard', () => {
  describe('Rendering', () => {
    it('should render task card', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByTestId('task-card')).toBeInTheDocument();
    });

    it('should render default title', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      render(<TaskCard title="My Tasks" tasks={mockTasks} />);
      expect(screen.getByText('My Tasks')).toBeInTheDocument();
    });

    it('should render completion count', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('1 of 3 completed')).toBeInTheDocument();
    });

    it('should render all tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Review pull requests')).toBeInTheDocument();
      expect(screen.getByText('Update dependencies')).toBeInTheDocument();
    });
  });

  describe('Task Items', () => {
    it('should render task title', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
    });

    it('should render task description', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('Write comprehensive docs for the project')).toBeInTheDocument();
    });

    it('should render task checkbox', () => {
      render(<TaskCard tasks={mockTasks} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('should check completed tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      const checkbox = screen.getByTestId('task-card-item-1-checkbox');
      expect(checkbox).toBeChecked();
    });

    it('should not check incomplete tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      const checkbox = screen.getByTestId('task-card-item-0-checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render priority badge', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('should render due date', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText(/Due: 2024-12-31/)).toBeInTheDocument();
    });

    it('should highlight overdue tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      const overdueDate = screen.getByText(/⚠️ Due: 2023-01-01/);
      expect(overdueDate).toHaveClass('task-item-overdue');
    });

    it('should render assignee name', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render assignee avatar', () => {
      render(<TaskCard tasks={mockTasks} />);
      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toHaveAttribute('src', 'https://example.com/john.jpg');
    });

    it('should render assignee initial when no avatar', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Task Toggle', () => {
    it('should call onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();

      render(<TaskCard tasks={mockTasks} onToggle={onToggle} />);

      const checkbox = screen.getByTestId('task-card-item-0-checkbox');
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('1', true);
    });

    it('should call onToggle with false when unchecking', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();

      render(<TaskCard tasks={mockTasks} onToggle={onToggle} />);

      const checkbox = screen.getByTestId('task-card-item-1-checkbox');
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('2', false);
    });
  });

  describe('Task Click', () => {
    it('should call onTaskClick when task is clicked', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<TaskCard tasks={mockTasks} onTaskClick={onTaskClick} />);

      await user.click(screen.getByText('Complete project documentation'));
      expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should have clickable class when onTaskClick provided', () => {
      render(<TaskCard tasks={mockTasks} onTaskClick={jest.fn()} />);
      const item = screen.getByTestId('task-card-item-0');
      expect(item).toHaveClass('task-item-clickable');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<TaskCard tasks={mockTasks} onTaskClick={onTaskClick} />);

      const item = screen.getByTestId('task-card-item-0');
      item.focus();
      await user.keyboard('{Enter}');

      expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should not trigger onTaskClick when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();
      const onToggle = jest.fn();

      render(<TaskCard tasks={mockTasks} onTaskClick={onTaskClick} onToggle={onToggle} />);

      const checkbox = screen.getByTestId('task-card-item-0-checkbox');
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalled();
      expect(onTaskClick).not.toHaveBeenCalled();
    });
  });

  describe('Add Task', () => {
    it('should render add task button when onAddTask provided', () => {
      render(<TaskCard tasks={mockTasks} onAddTask={jest.fn()} />);
      expect(screen.getByText('+ Add Task')).toBeInTheDocument();
    });

    it('should not render add task button when onAddTask not provided', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.queryByText('+ Add Task')).not.toBeInTheDocument();
    });

    it('should call onAddTask when button clicked', async () => {
      const user = userEvent.setup();
      const onAddTask = jest.fn();

      render(<TaskCard tasks={mockTasks} onAddTask={onAddTask} />);

      await user.click(screen.getByText('+ Add Task'));
      expect(onAddTask).toHaveBeenCalled();
    });
  });

  describe('Show Completed', () => {
    it('should show completed tasks by default', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByText('Review pull requests')).toBeInTheDocument();
    });

    it('should hide completed tasks when showCompleted is false', () => {
      render(<TaskCard tasks={mockTasks} showCompleted={false} />);
      expect(screen.queryByText('Review pull requests')).not.toBeInTheDocument();
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
    });

    it('should update completion count when hiding completed', () => {
      render(<TaskCard tasks={mockTasks} showCompleted={false} />);
      expect(screen.getByText('1 of 3 completed')).toBeInTheDocument();
    });
  });

  describe('Max Tasks', () => {
    it('should limit displayed tasks', () => {
      render(<TaskCard tasks={mockTasks} maxTasks={2} />);
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Review pull requests')).toBeInTheDocument();
      expect(screen.queryByText('Update dependencies')).not.toBeInTheDocument();
    });

    it('should show all tasks by default', () => {
      render(<TaskCard tasks={mockTasks} maxTasks={10} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no tasks', () => {
      render(<TaskCard tasks={[]} />);
      expect(screen.getByTestId('task-card-empty')).toBeInTheDocument();
    });

    it('should show default empty message', () => {
      render(<TaskCard tasks={[]} />);
      expect(screen.getByText('No tasks')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(<TaskCard tasks={[]} emptyMessage="All tasks completed!" />);
      expect(screen.getByText('All tasks completed!')).toBeInTheDocument();
    });

    it('should not show completion count when no tasks', () => {
      render(<TaskCard tasks={[]} />);
      expect(screen.queryByText(/completed/)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<TaskCard tasks={mockTasks} isLoading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide tasks when loading', () => {
      render(<TaskCard tasks={mockTasks} isLoading />);
      expect(screen.queryByText('Complete project documentation')).not.toBeInTheDocument();
    });
  });

  describe('Priority Styling', () => {
    it('should apply priority class to high priority tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      const item = screen.getByTestId('task-card-item-0');
      expect(item).toHaveClass('task-item-priority-high');
    });

    it('should apply correct badge variant', () => {
      render(<TaskCard tasks={mockTasks} />);
      const highBadge = screen.getByTestId('task-card-item-0-priority');
      expect(highBadge).toHaveClass('task-item-priority-badge-high');
    });
  });

  describe('Completed State Styling', () => {
    it('should apply completed class', () => {
      render(<TaskCard tasks={mockTasks} />);
      const completedItem = screen.getByTestId('task-card-item-1');
      expect(completedItem).toHaveClass('task-item-completed');
    });

    it('should not apply completed class to incomplete tasks', () => {
      render(<TaskCard tasks={mockTasks} />);
      const incompleteItem = screen.getByTestId('task-card-item-0');
      expect(incompleteItem).not.toHaveClass('task-item-completed');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on checkboxes', () => {
      render(<TaskCard tasks={mockTasks} />);
      expect(screen.getByLabelText(/Mark "Complete project documentation" as complete/)).toBeInTheDocument();
    });

    it('should have proper button role for clickable tasks', () => {
      render(<TaskCard tasks={mockTasks} onTaskClick={jest.fn()} />);
      const item = screen.getByTestId('task-card-item-0');
      expect(item).toHaveAttribute('role', 'button');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper ARIA label on add button', () => {
      render(<TaskCard tasks={mockTasks} onAddTask={jest.fn()} />);
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<TaskCard tasks={mockTasks} className="custom-task-card" />);
      expect(screen.getByTestId('task-card')).toHaveClass('custom-task-card');
    });
  });
});
