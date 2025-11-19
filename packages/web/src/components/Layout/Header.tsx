/**
 * Header Component
 * Main navigation header with user menu and controls
 */
import React from 'react';
import { ThemeToggle } from '../../theme';
import { LanguageSwitcher } from '../../i18n';
import { useTranslation } from '../../i18n';
import { Button } from '../Button';

export interface HeaderProps {
  /** App logo/name */
  logo?: React.ReactNode;
  /** Navigation items */
  navigationItems?: Array<{
    label: string;
    href: string;
    active?: boolean;
    onClick?: () => void;
  }>;
  /** User info */
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  /** User menu items */
  userMenuItems?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }>;
  /** Show theme toggle */
  showThemeToggle?: boolean;
  /** Show language switcher */
  showLanguageSwitcher?: boolean;
  /** Callback to toggle sidebar */
  onToggleSidebar?: () => void;
  /** Custom className */
  className?: string;
}

export function Header({
  logo,
  navigationItems = [],
  user,
  userMenuItems = [],
  showThemeToggle = true,
  showLanguageSwitcher = true,
  onToggleSidebar,
  className = '',
}: HeaderProps) {
  const { t } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className={`header ${className}`} data-testid="header">
      <div className="header-container">
        {/* Left Section */}
        <div className="header-left">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="header-sidebar-toggle"
              aria-label="Toggle sidebar"
              data-testid="sidebar-toggle"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12H21M3 6H21M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {logo && (
            <div className="header-logo" data-testid="header-logo">
              {logo}
            </div>
          )}

          {/* Navigation */}
          {navigationItems.length > 0 && (
            <nav className="header-nav" data-testid="header-nav">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={`header-nav-item ${item.active ? 'active' : ''}`}
                  data-testid={`nav-item-${index}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="header-right">
          {showThemeToggle && (
            <div className="header-control" data-testid="header-theme-toggle">
              <ThemeToggle />
            </div>
          )}

          {showLanguageSwitcher && (
            <div className="header-control" data-testid="header-language-switcher">
              <LanguageSwitcher variant="dropdown" />
            </div>
          )}

          {/* User Menu */}
          {user && (
            <div className="header-user-menu" data-testid="header-user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="header-user-button"
                data-testid="user-menu-button"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="header-user-avatar"
                  />
                ) : (
                  <div className="header-user-avatar-placeholder">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="header-user-name">{user.name}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`header-user-chevron ${userMenuOpen ? 'open' : ''}`}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  className="header-user-dropdown"
                  data-testid="user-menu-dropdown"
                >
                  <div className="header-user-info">
                    <div className="header-user-info-name">{user.name}</div>
                    <div className="header-user-info-email">{user.email}</div>
                  </div>

                  {userMenuItems.length > 0 && (
                    <div className="header-user-menu-items">
                      {userMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.onClick();
                            setUserMenuOpen(false);
                          }}
                          className="header-user-menu-item"
                          data-testid={`user-menu-item-${index}`}
                        >
                          {item.icon && (
                            <span className="header-user-menu-item-icon">
                              {item.icon}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
