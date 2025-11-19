/**
 * Layout Component
 * Main application layout with header, sidebar, and footer
 */
import React, { useState } from 'react';
import { Header, HeaderProps } from './Header';
import { Sidebar, SidebarProps } from './Sidebar';
import { Footer, FooterProps } from './Footer';

export interface LayoutProps {
  /** Layout children (main content) */
  children: React.ReactNode;
  /** Header props */
  headerProps?: Omit<HeaderProps, 'onToggleSidebar'>;
  /** Sidebar props */
  sidebarProps?: Omit<SidebarProps, 'collapsed'>;
  /** Footer props */
  footerProps?: FooterProps;
  /** Show header */
  showHeader?: boolean;
  /** Show sidebar */
  showSidebar?: boolean;
  /** Show footer */
  showFooter?: boolean;
  /** Initial sidebar collapsed state */
  initialSidebarCollapsed?: boolean;
  /** Custom className */
  className?: string;
}

export function Layout({
  children,
  headerProps,
  sidebarProps,
  footerProps,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  initialSidebarCollapsed = false,
  className = '',
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div
      className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${className}`}
      data-testid="layout"
    >
      {showHeader && (
        <Header
          {...headerProps}
          onToggleSidebar={showSidebar ? toggleSidebar : undefined}
        />
      )}

      <div className="layout-body" data-testid="layout-body">
        {showSidebar && sidebarProps && (
          <Sidebar {...sidebarProps} collapsed={sidebarCollapsed} />
        )}

        <main className="layout-main" data-testid="layout-main">
          {children}
        </main>
      </div>

      {showFooter && <Footer {...footerProps} />}
    </div>
  );
}
