/**
 * Tests for Header Component
 * Coverage: Logo, navigation, user menu, theme toggle, language switcher
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n/config';
import { ThemeProvider } from '../../../theme';
import { Header } from '../Header';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}

describe('Header', () => {
  describe('Rendering', () => {
    it('should render header', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should render logo when provided', () => {
      render(
        <TestWrapper>
          <Header logo={<div>My App Logo</div>} />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-logo')).toHaveTextContent('My App Logo');
    });

    it('should render navigation items', () => {
      const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ];

      render(
        <TestWrapper>
          <Header navigationItems={navItems} />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-nav')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should mark active navigation item', () => {
      const navItems = [
        { label: 'Home', href: '/', active: true },
        { label: 'About', href: '/about', active: false },
      ];

      render(
        <TestWrapper>
          <Header navigationItems={navItems} />
        </TestWrapper>
      );

      const homeLink = screen.getByTestId('nav-item-0');
      expect(homeLink).toHaveClass('active');
    });

    it('should render sidebar toggle when callback provided', () => {
      const onToggleSidebar = jest.fn();

      render(
        <TestWrapper>
          <Header onToggleSidebar={onToggleSidebar} />
        </TestWrapper>
      );

      expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    });

    it('should not render sidebar toggle when no callback', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle by default', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-theme-toggle')).toBeInTheDocument();
    });

    it('should hide theme toggle when showThemeToggle is false', () => {
      render(
        <TestWrapper>
          <Header showThemeToggle={false} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('header-theme-toggle')).not.toBeInTheDocument();
    });
  });

  describe('Language Switcher', () => {
    it('should render language switcher by default', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-language-switcher')).toBeInTheDocument();
    });

    it('should hide language switcher when showLanguageSwitcher is false', () => {
      render(
        <TestWrapper>
          <Header showLanguageSwitcher={false} />
        </TestWrapper>
      );

      expect(
        screen.queryByTestId('header-language-switcher')
      ).not.toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should render user menu when user is provided', () => {
      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-user-menu')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should not render user menu when no user', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.queryByTestId('header-user-menu')).not.toBeInTheDocument();
    });

    it('should render user avatar when provided', () => {
      render(
        <TestWrapper>
          <Header user={{ ...mockUser, avatar: 'https://example.com/avatar.jpg' }} />
        </TestWrapper>
      );

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should render avatar placeholder when no avatar', () => {
      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter
    });

    it('should toggle user menu dropdown on click', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      const menuButton = screen.getByTestId('user-menu-button');

      // Menu should be closed initially
      expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument();

      // Click to open
      await user.click(menuButton);
      expect(screen.getByTestId('user-menu-dropdown')).toBeInTheDocument();

      // Click to close
      await user.click(menuButton);
      expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument();
    });

    it('should render user info in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('user-menu-button'));

      const dropdown = screen.getByTestId('user-menu-dropdown');
      expect(within(dropdown).getByText('John Doe')).toBeInTheDocument();
      expect(within(dropdown).getByText('john@example.com')).toBeInTheDocument();
    });

    it('should render user menu items', async () => {
      const user = userEvent.setup();
      const menuItems = [
        { label: 'Profile', onClick: jest.fn() },
        { label: 'Settings', onClick: jest.fn() },
        { label: 'Logout', onClick: jest.fn() },
      ];

      render(
        <TestWrapper>
          <Header user={mockUser} userMenuItems={menuItems} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('user-menu-button'));

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should call onClick when menu item is clicked', async () => {
      const user = userEvent.setup();
      const onProfileClick = jest.fn();
      const menuItems = [{ label: 'Profile', onClick: onProfileClick }];

      render(
        <TestWrapper>
          <Header user={mockUser} userMenuItems={menuItems} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('user-menu-button'));
      await user.click(screen.getByText('Profile'));

      expect(onProfileClick).toHaveBeenCalled();
    });

    it('should close menu after item click', async () => {
      const user = userEvent.setup();
      const menuItems = [{ label: 'Profile', onClick: jest.fn() }];

      render(
        <TestWrapper>
          <Header user={mockUser} userMenuItems={menuItems} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('user-menu-button'));
      expect(screen.getByTestId('user-menu-dropdown')).toBeInTheDocument();

      await user.click(screen.getByText('Profile'));
      expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Click Handlers', () => {
    it('should call onClick when navigation item is clicked', async () => {
      const user = userEvent.setup();
      const onHomeClick = jest.fn();
      const navItems = [{ label: 'Home', href: '/', onClick: onHomeClick }];

      render(
        <TestWrapper>
          <Header navigationItems={navItems} />
        </TestWrapper>
      );

      await user.click(screen.getByText('Home'));

      expect(onHomeClick).toHaveBeenCalled();
    });
  });

  describe('Sidebar Toggle', () => {
    it('should call onToggleSidebar when button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleSidebar = jest.fn();

      render(
        <TestWrapper>
          <Header onToggleSidebar={onToggleSidebar} />
        </TestWrapper>
      );

      await user.click(screen.getByTestId('sidebar-toggle'));

      expect(onToggleSidebar).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on sidebar toggle', () => {
      render(
        <TestWrapper>
          <Header onToggleSidebar={jest.fn()} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    it('should have aria-expanded on user menu button', async () => {
      const user = userEvent.setup();
      const mockUser = { name: 'John Doe', email: 'john@example.com' };

      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      const menuButton = screen.getByTestId('user-menu-button');

      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      await user.click(menuButton);

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-haspopup on user menu button', () => {
      const mockUser = { name: 'John Doe', email: 'john@example.com' };

      render(
        <TestWrapper>
          <Header user={mockUser} />
        </TestWrapper>
      );

      expect(screen.getByTestId('user-menu-button')).toHaveAttribute(
        'aria-haspopup',
        'true'
      );
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <Header className="custom-header" />
        </TestWrapper>
      );

      expect(screen.getByTestId('header')).toHaveClass('custom-header');
    });
  });
});
