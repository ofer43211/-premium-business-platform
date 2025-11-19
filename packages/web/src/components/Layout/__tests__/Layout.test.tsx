/**
 * Tests for Layout Component
 * Coverage: Integration of Header, Sidebar, Footer, sidebar toggle, show/hide props
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ThemeProvider } from '../../../theme';
import { Layout } from '../Layout';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}

const mockSidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Users', href: '/users', icon: '👥' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

const mockNavItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

describe('Layout', () => {
  describe('Rendering', () => {
    it('should render layout', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <TestWrapper>
          <Layout>
            <div data-testid="main-content">Main Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should render header by default', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render sidebar by default', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render footer by default', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Show/Hide Components', () => {
    it('should hide header when showHeader is false', () => {
      render(
        <TestWrapper>
          <Layout showHeader={false}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    });

    it('should hide sidebar when showSidebar is false', () => {
      render(
        <TestWrapper>
          <Layout showSidebar={false}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should hide footer when showFooter is false', () => {
      render(
        <TestWrapper>
          <Layout showFooter={false}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    });

    it('should hide all components when all show props are false', () => {
      render(
        <TestWrapper>
          <Layout showHeader={false} showSidebar={false} showFooter={false}>
            <div data-testid="content">Content Only</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Component Props Passing', () => {
    it('should pass headerProps to Header component', () => {
      render(
        <TestWrapper>
          <Layout
            headerProps={{
              logo: <div>Custom Logo</div>,
              navigationItems: mockNavItems,
              user: mockUser,
            }}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('header-logo')).toHaveTextContent('Custom Logo');
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should pass sidebarProps to Sidebar component', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should pass footerProps to Footer component', () => {
      const footerLinks = [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ];

      render(
        <TestWrapper>
          <Layout
            footerProps={{
              copyright: '© 2024 Test Company',
              links: footerLinks,
            }}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('© 2024 Test Company')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Terms')).toBeInTheDocument();
    });
  });

  describe('Sidebar Toggle', () => {
    it('should render sidebar toggle button in header', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    });

    it('should toggle sidebar collapsed state on button click', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      const toggleButton = screen.getByTestId('sidebar-toggle');

      // Initially not collapsed
      expect(sidebar).not.toHaveClass('collapsed');

      // Click to collapse
      await user.click(toggleButton);
      expect(sidebar).toHaveClass('collapsed');

      // Click to expand
      await user.click(toggleButton);
      expect(sidebar).not.toHaveClass('collapsed');
    });

    it('should not render sidebar toggle when sidebar is hidden', () => {
      render(
        <TestWrapper>
          <Layout showSidebar={false}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
    });

    it('should respect initialSidebarCollapsed prop', () => {
      render(
        <TestWrapper>
          <Layout
            sidebarProps={{ items: mockSidebarItems }}
            initialSidebarCollapsed={true}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });

    it('should update layout width when sidebar is toggled', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const layoutBody = screen.getByTestId('layout-body');
      const toggleButton = screen.getByTestId('sidebar-toggle');

      // Check initial state
      expect(layoutBody).toHaveClass('sidebar-expanded');

      // Collapse sidebar
      await user.click(toggleButton);
      expect(layoutBody).toHaveClass('sidebar-collapsed');

      // Expand sidebar
      await user.click(toggleButton);
      expect(layoutBody).toHaveClass('sidebar-expanded');
    });
  });

  describe('Layout Structure', () => {
    it('should have correct DOM structure', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div data-testid="content">Content</div>
          </Layout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('layout');
      const header = within(layout).getByTestId('header');
      const layoutBody = within(layout).getByTestId('layout-body');
      const sidebar = within(layoutBody).getByTestId('sidebar');
      const main = within(layoutBody).getByRole('main');
      const footer = within(layout).getByTestId('footer');

      expect(layout).toContainElement(header);
      expect(layout).toContainElement(layoutBody);
      expect(layoutBody).toContainElement(sidebar);
      expect(layoutBody).toContainElement(main);
      expect(layout).toContainElement(footer);
    });

    it('should render main content in main element', () => {
      render(
        <TestWrapper>
          <Layout>
            <div data-testid="content">Main Content</div>
          </Layout>
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(within(main).getByTestId('content')).toBeInTheDocument();
    });

    it('should apply correct classes to layout body', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const layoutBody = screen.getByTestId('layout-body');
      expect(layoutBody).toHaveClass('layout-body');
      expect(layoutBody).toHaveClass('sidebar-expanded');
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply responsive classes', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('layout');
      expect(layout).toHaveClass('layout');
    });

    it('should handle mobile viewport', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('layout');
      expect(layout).toBeInTheDocument();
    });
  });

  describe('Sidebar Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save sidebar state to localStorage', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout
            sidebarProps={{ items: mockSidebarItems }}
            persistSidebarState={true}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('sidebar-toggle');
      await user.click(toggleButton);

      expect(localStorage.getItem('sidebar-collapsed')).toBe('true');
    });

    it('should restore sidebar state from localStorage', () => {
      localStorage.setItem('sidebar-collapsed', 'true');

      render(
        <TestWrapper>
          <Layout
            sidebarProps={{ items: mockSidebarItems }}
            persistSidebarState={true}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });

    it('should not use localStorage when persistSidebarState is false', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout
            sidebarProps={{ items: mockSidebarItems }}
            persistSidebarState={false}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const toggleButton = screen.getByTestId('sidebar-toggle');
      await user.click(toggleButton);

      expect(localStorage.getItem('sidebar-collapsed')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper landmark roles', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // sidebar
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should have skip to main content link', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('should focus main content when skip link is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const skipLink = screen.getByText('Skip to main content');
      await user.click(skipLink);

      const main = screen.getByRole('main');
      expect(main).toHaveFocus();
    });

    it('should have aria-label on sidebar toggle', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to layout', () => {
      render(
        <TestWrapper>
          <Layout className="custom-layout">
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout')).toHaveClass('custom-layout');
    });

    it('should preserve base classes when adding custom className', () => {
      render(
        <TestWrapper>
          <Layout className="custom-layout">
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const layout = screen.getByTestId('layout');
      expect(layout).toHaveClass('layout');
      expect(layout).toHaveClass('custom-layout');
    });
  });

  describe('Integration', () => {
    it('should integrate header user menu with sidebar', () => {
      render(
        <TestWrapper>
          <Layout
            headerProps={{ user: mockUser }}
            sidebarProps={{ items: mockSidebarItems }}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should coordinate theme between header and content', () => {
      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      // Theme toggle should be in header
      const themeToggle = screen.getByTestId('header-theme-toggle');
      expect(themeToggle).toBeInTheDocument();
    });

    it('should coordinate language between header and footer', () => {
      render(
        <TestWrapper>
          <Layout
            headerProps={{ showLanguageSwitcher: true }}
            footerProps={{ links: [{ label: 'About', href: '/about' }] }}
          >
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      // Language switcher should be in header
      const languageSwitcher = screen.getByTestId('header-language-switcher');
      expect(languageSwitcher).toBeInTheDocument();
    });

    it('should handle sidebar item clicks', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      render(
        <TestWrapper>
          <Layout sidebarProps={{ items: mockSidebarItems, onItemClick }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      await user.click(screen.getByText('Dashboard'));
      expect(onItemClick).toHaveBeenCalledWith(mockSidebarItems[0]);
    });

    it('should handle header navigation clicks', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const navItems = [{ label: 'Home', href: '/', onClick }];

      render(
        <TestWrapper>
          <Layout headerProps={{ navigationItems: navItems }}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      await user.click(screen.getByText('Home'));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Content Scrolling', () => {
    it('should make main content scrollable', () => {
      render(
        <TestWrapper>
          <Layout>
            <div style={{ height: '2000px' }}>Tall Content</div>
          </Layout>
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('layout-main');
    });

    it('should keep header fixed while content scrolls', () => {
      render(
        <TestWrapper>
          <Layout>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      const header = screen.getByTestId('header');
      expect(header).toHaveClass('header');
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(
        <TestWrapper>
          <Layout isLoading={true}>
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-loading')).toBeInTheDocument();
    });

    it('should hide content when loading', () => {
      render(
        <TestWrapper>
          <Layout isLoading={true}>
            <div data-testid="content">Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('should show content when not loading', () => {
      render(
        <TestWrapper>
          <Layout isLoading={false}>
            <div data-testid="content">Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.queryByTestId('layout-loading')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error state', () => {
      render(
        <TestWrapper>
          <Layout error="Something went wrong">
            <div>Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should hide content when error is shown', () => {
      render(
        <TestWrapper>
          <Layout error="Error occurred">
            <div data-testid="content">Content</div>
          </Layout>
        </TestWrapper>
      );

      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });
});
