/**
 * Tests for Sidebar Component
 * Coverage: Rendering, collapsed state, nested items, badges, click handlers
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '../Sidebar';

const mockItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Users',
    href: '/users',
    icon: '👥',
    badge: '12',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    children: [
      { label: 'Profile', href: '/settings/profile' },
      { label: 'Security', href: '/settings/security' },
      { label: 'Billing', href: '/settings/billing' },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: '📈',
    active: true,
  },
];

describe('Sidebar', () => {
  describe('Rendering', () => {
    it('should render sidebar', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render all items', () => {
      render(<Sidebar items={mockItems} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should render icons when provided', () => {
      render(<Sidebar items={mockItems} />);

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });

    it('should render badge when provided', () => {
      render(<Sidebar items={mockItems} />);

      expect(screen.getByTestId('sidebar-badge-1')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-badge-1')).toHaveTextContent('12');
    });

    it('should mark active item', () => {
      render(<Sidebar items={mockItems} />);

      const reportsItem = screen.getByTestId('sidebar-item-3');
      expect(reportsItem).toHaveClass('active');
    });

    it('should render nested items initially collapsed', () => {
      render(<Sidebar items={mockItems} />);

      // Nested items should not be visible initially
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Security')).not.toBeInTheDocument();
      expect(screen.queryByText('Billing')).not.toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('should render in collapsed state', () => {
      render(<Sidebar items={mockItems} collapsed />);

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });

    it('should hide labels when collapsed', () => {
      render(<Sidebar items={mockItems} collapsed />);

      const sidebar = screen.getByTestId('sidebar');

      // Labels should still be in DOM but visually hidden
      expect(within(sidebar).getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-item-0')).toHaveClass('collapsed');
    });

    it('should still show icons when collapsed', () => {
      render(<Sidebar items={mockItems} collapsed />);

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('👥')).toBeInTheDocument();
    });

    it('should not show nested items when collapsed', () => {
      render(<Sidebar items={mockItems} collapsed />);

      // Even if we try to expand, nested items shouldn't show when sidebar is collapsed
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  describe('Nested Items', () => {
    it('should expand nested items on click', async () => {
      const user = userEvent.setup();

      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);

      // Nested items should now be visible
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
    });

    it('should collapse nested items on second click', async () => {
      const user = userEvent.setup();

      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByText('Settings');

      // Expand
      await user.click(settingsItem);
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Collapse
      await user.click(settingsItem);
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    it('should render expand/collapse icon for items with children', () => {
      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByTestId('sidebar-item-2');
      expect(within(settingsItem).getByTestId('expand-icon')).toBeInTheDocument();
    });

    it('should not render expand icon for items without children', () => {
      render(<Sidebar items={mockItems} />);

      const dashboardItem = screen.getByTestId('sidebar-item-0');
      expect(within(dashboardItem).queryByTestId('expand-icon')).not.toBeInTheDocument();
    });

    it('should change expand icon when expanded', async () => {
      const user = userEvent.setup();

      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByTestId('sidebar-item-2');
      const expandIcon = within(settingsItem).getByTestId('expand-icon');

      // Initially collapsed
      expect(expandIcon).toHaveClass('collapsed');

      // Click to expand
      await user.click(screen.getByText('Settings'));
      expect(expandIcon).toHaveClass('expanded');
    });

    it('should indent nested items', async () => {
      const user = userEvent.setup();

      render(<Sidebar items={mockItems} />);

      await user.click(screen.getByText('Settings'));

      const nestedItem = screen.getByTestId('sidebar-item-2-0');
      expect(nestedItem).toHaveClass('nested');
      expect(nestedItem).toHaveAttribute('data-depth', '1');
    });
  });

  describe('Click Handlers', () => {
    it('should call onClick when item is clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const items = [
        {
          label: 'Dashboard',
          href: '/dashboard',
          onClick,
        },
      ];

      render(<Sidebar items={items} />);

      await user.click(screen.getByText('Dashboard'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should call onItemClick callback', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      render(<Sidebar items={mockItems} onItemClick={onItemClick} />);

      await user.click(screen.getByText('Dashboard'));
      expect(onItemClick).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should call both item onClick and onItemClick', async () => {
      const user = userEvent.setup();
      const itemOnClick = jest.fn();
      const onItemClick = jest.fn();

      const items = [
        {
          label: 'Dashboard',
          href: '/dashboard',
          onClick: itemOnClick,
        },
      ];

      render(<Sidebar items={items} onItemClick={onItemClick} />);

      await user.click(screen.getByText('Dashboard'));
      expect(itemOnClick).toHaveBeenCalled();
      expect(onItemClick).toHaveBeenCalledWith(items[0]);
    });

    it('should not navigate for items with children when clicked', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      render(<Sidebar items={mockItems} onItemClick={onItemClick} />);

      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);

      // Should toggle expansion, not navigate
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should call onClick for nested items', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      const onItemClick = jest.fn();

      const items = [
        {
          label: 'Settings',
          href: '/settings',
          children: [
            {
              label: 'Profile',
              href: '/settings/profile',
              onClick,
            },
          ],
        },
      ];

      render(<Sidebar items={items} onItemClick={onItemClick} />);

      // Expand parent
      await user.click(screen.getByText('Settings'));

      // Click nested item
      await user.click(screen.getByText('Profile'));
      expect(onClick).toHaveBeenCalled();
      expect(onItemClick).toHaveBeenCalled();
    });
  });

  describe('Multiple Nested Sections', () => {
    it('should allow multiple sections to be expanded simultaneously', async () => {
      const user = userEvent.setup();

      const items = [
        {
          label: 'Section 1',
          href: '#',
          children: [{ label: 'Item 1-1', href: '#' }],
        },
        {
          label: 'Section 2',
          href: '#',
          children: [{ label: 'Item 2-1', href: '#' }],
        },
      ];

      render(<Sidebar items={items} />);

      await user.click(screen.getByText('Section 1'));
      await user.click(screen.getByText('Section 2'));

      expect(screen.getByText('Item 1-1')).toBeInTheDocument();
      expect(screen.getByText('Item 2-1')).toBeInTheDocument();
    });

    it('should maintain expansion state when collapsing other sections', async () => {
      const user = userEvent.setup();

      const items = [
        {
          label: 'Section 1',
          href: '#',
          children: [{ label: 'Item 1-1', href: '#' }],
        },
        {
          label: 'Section 2',
          href: '#',
          children: [{ label: 'Item 2-1', href: '#' }],
        },
      ];

      render(<Sidebar items={items} />);

      // Expand both
      await user.click(screen.getByText('Section 1'));
      await user.click(screen.getByText('Section 2'));

      // Collapse Section 2
      await user.click(screen.getByText('Section 2'));

      // Section 1 should still be expanded
      expect(screen.getByText('Item 1-1')).toBeInTheDocument();
      expect(screen.queryByText('Item 2-1')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation role', () => {
      render(<Sidebar items={mockItems} />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should have aria-label on sidebar', () => {
      render(<Sidebar items={mockItems} />);

      expect(screen.getByLabelText('Sidebar navigation')).toBeInTheDocument();
    });

    it('should have aria-expanded on expandable items', () => {
      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByTestId('sidebar-item-2').querySelector('a');
      expect(settingsItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when expanded', async () => {
      const user = userEvent.setup();

      render(<Sidebar items={mockItems} />);

      const settingsItem = screen.getByTestId('sidebar-item-2').querySelector('a');

      await user.click(screen.getByText('Settings'));
      expect(settingsItem).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-current on active item', () => {
      render(<Sidebar items={mockItems} />);

      const reportsItem = screen.getByTestId('sidebar-item-3').querySelector('a');
      expect(reportsItem).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current on inactive items', () => {
      render(<Sidebar items={mockItems} />);

      const dashboardItem = screen.getByTestId('sidebar-item-0').querySelector('a');
      expect(dashboardItem).not.toHaveAttribute('aria-current');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Sidebar items={mockItems} className="custom-sidebar" />);

      expect(screen.getByTestId('sidebar')).toHaveClass('custom-sidebar');
    });

    it('should preserve base classes when adding custom className', () => {
      render(<Sidebar items={mockItems} className="custom-sidebar" />);

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('sidebar');
      expect(sidebar).toHaveClass('custom-sidebar');
    });
  });

  describe('Empty State', () => {
    it('should handle empty items array', () => {
      render(<Sidebar items={[]} />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render empty state message when no items', () => {
      render(<Sidebar items={[]} />);

      expect(screen.getByTestId('sidebar-empty')).toBeInTheDocument();
      expect(screen.getByText('No navigation items')).toBeInTheDocument();
    });
  });

  describe('Deep Nesting', () => {
    it('should handle deeply nested items', async () => {
      const user = userEvent.setup();

      const items = [
        {
          label: 'Level 1',
          href: '#',
          children: [
            {
              label: 'Level 2',
              href: '#',
              children: [
                {
                  label: 'Level 3',
                  href: '#',
                },
              ],
            },
          ],
        },
      ];

      render(<Sidebar items={items} />);

      // Expand Level 1
      await user.click(screen.getByText('Level 1'));
      expect(screen.getByText('Level 2')).toBeInTheDocument();

      // Expand Level 2
      await user.click(screen.getByText('Level 2'));
      expect(screen.getByText('Level 3')).toBeInTheDocument();
    });

    it('should apply correct depth styling to nested items', async () => {
      const user = userEvent.setup();

      const items = [
        {
          label: 'Level 1',
          href: '#',
          children: [
            {
              label: 'Level 2',
              href: '#',
              children: [
                {
                  label: 'Level 3',
                  href: '#',
                },
              ],
            },
          ],
        },
      ];

      render(<Sidebar items={items} />);

      await user.click(screen.getByText('Level 1'));
      await user.click(screen.getByText('Level 2'));

      const level2Item = screen.getByTestId('sidebar-item-0-0');
      const level3Item = screen.getByTestId('sidebar-item-0-0-0');

      expect(level2Item).toHaveAttribute('data-depth', '1');
      expect(level3Item).toHaveAttribute('data-depth', '2');
    });
  });

  describe('Badge Variants', () => {
    it('should render badge with default variant', () => {
      const items = [
        {
          label: 'Messages',
          href: '/messages',
          badge: '5',
        },
      ];

      render(<Sidebar items={items} />);

      const badge = screen.getByTestId('sidebar-badge-0');
      expect(badge).toHaveClass('badge');
      expect(badge).not.toHaveClass('badge-primary');
    });

    it('should render badge with custom variant', () => {
      const items = [
        {
          label: 'Alerts',
          href: '/alerts',
          badge: '3',
          badgeVariant: 'danger' as const,
        },
      ];

      render(<Sidebar items={items} />);

      const badge = screen.getByTestId('sidebar-badge-0');
      expect(badge).toHaveClass('badge-danger');
    });
  });

  describe('Disabled Items', () => {
    it('should render disabled items', () => {
      const items = [
        {
          label: 'Disabled',
          href: '/disabled',
          disabled: true,
        },
      ];

      render(<Sidebar items={items} />);

      const item = screen.getByTestId('sidebar-item-0');
      expect(item).toHaveClass('disabled');
    });

    it('should not call onClick for disabled items', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const items = [
        {
          label: 'Disabled',
          href: '/disabled',
          disabled: true,
          onClick,
        },
      ];

      render(<Sidebar items={items} />);

      await user.click(screen.getByText('Disabled'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not expand disabled items with children', async () => {
      const user = userEvent.setup();

      const items = [
        {
          label: 'Disabled Parent',
          href: '#',
          disabled: true,
          children: [
            {
              label: 'Child',
              href: '#',
            },
          ],
        },
      ];

      render(<Sidebar items={items} />);

      await user.click(screen.getByText('Disabled Parent'));
      expect(screen.queryByText('Child')).not.toBeInTheDocument();
    });
  });
});
