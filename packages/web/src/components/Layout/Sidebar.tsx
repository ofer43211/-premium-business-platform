/**
 * Sidebar Component
 * Collapsible navigation sidebar
 */
import React from 'react';

export interface SidebarItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  /** Sidebar items */
  items: SidebarItem[];
  /** Collapsed state */
  collapsed?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (item: SidebarItem) => void;
  /** Custom className */
  className?: string;
}

export function Sidebar({
  items,
  collapsed = false,
  onItemClick,
  className = '',
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const renderItem = (item: SidebarItem, index: number, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(index);

    return (
      <div
        key={index}
        className={`sidebar-item-wrapper ${depth > 0 ? 'nested' : ''}`}
        data-testid={`sidebar-item-${index}`}
      >
        <a
          href={item.href || '#'}
          onClick={(e) => {
            if (item.onClick || onItemClick) {
              e.preventDefault();
              if (hasChildren) {
                toggleExpanded(index);
              }
              item.onClick?.();
              onItemClick?.(item);
            }
          }}
          className={`sidebar-item ${item.active ? 'active' : ''} ${
            collapsed ? 'collapsed' : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 16}px` }}
          data-testid={`sidebar-link-${index}`}
        >
          {item.icon && (
            <span className="sidebar-item-icon" data-testid={`sidebar-icon-${index}`}>
              {item.icon}
            </span>
          )}

          {!collapsed && (
            <>
              <span className="sidebar-item-label">{item.label}</span>

              {item.badge && (
                <span className="sidebar-item-badge" data-testid={`sidebar-badge-${index}`}>
                  {item.badge}
                </span>
              )}

              {hasChildren && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`sidebar-item-chevron ${isExpanded ? 'expanded' : ''}`}
                >
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </>
          )}
        </a>

        {hasChildren && !collapsed && isExpanded && (
          <div className="sidebar-children">
            {item.children!.map((child, childIndex) =>
              renderItem(child, index * 1000 + childIndex, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''} ${className}`}
      data-testid="sidebar"
    >
      <nav className="sidebar-nav" data-testid="sidebar-nav">
        {items.map((item, index) => renderItem(item, index))}
      </nav>
    </aside>
  );
}
