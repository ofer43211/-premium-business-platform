/**
 * Tests for Footer Component
 * Coverage: Rendering, links, social links, copyright, click handlers
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Footer } from '../Footer';

const mockLinks = [
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
];

const mockSocialLinks = [
  { platform: 'twitter' as const, url: 'https://twitter.com/example', label: 'Twitter' },
  { platform: 'facebook' as const, url: 'https://facebook.com/example', label: 'Facebook' },
  { platform: 'linkedin' as const, url: 'https://linkedin.com/company/example', label: 'LinkedIn' },
  { platform: 'github' as const, url: 'https://github.com/example', label: 'GitHub' },
];

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render footer', () => {
      render(<Footer />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render default copyright text', () => {
      render(<Footer />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(
          `© ${currentYear} Premium Business Platform. All rights reserved.`
        )
      ).toBeInTheDocument();
    });

    it('should render custom copyright text', () => {
      render(<Footer copyright="© 2024 My Company" />);

      expect(screen.getByText('© 2024 My Company')).toBeInTheDocument();
    });

    it('should render footer links', () => {
      render(<Footer links={mockLinks} />);

      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render social links', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    });

    it('should render footer without links', () => {
      render(<Footer />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render all sections together', () => {
      render(
        <Footer
          copyright="© 2024 Test"
          links={mockLinks}
          socialLinks={mockSocialLinks}
        />
      );

      expect(screen.getByText('© 2024 Test')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    });
  });

  describe('Footer Links', () => {
    it('should have correct href attributes', () => {
      render(<Footer links={mockLinks} />);

      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).toHaveAttribute('href', '/about');

      const privacyLink = screen.getByText('Privacy Policy').closest('a');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should call onClick when link is clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const links = [
        { label: 'About', href: '/about', onClick },
      ];

      render(<Footer links={links} />);

      await user.click(screen.getByText('About'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should render links with custom target', () => {
      const links = [
        { label: 'Blog', href: 'https://blog.example.com', target: '_blank' as const },
      ];

      render(<Footer links={links} />);

      const blogLink = screen.getByText('Blog').closest('a');
      expect(blogLink).toHaveAttribute('target', '_blank');
      expect(blogLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not add rel attribute for internal links', () => {
      const links = [
        { label: 'About', href: '/about' },
      ];

      render(<Footer links={links} />);

      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).not.toHaveAttribute('rel');
    });

    it('should render separator between links', () => {
      render(<Footer links={mockLinks} />);

      const separators = screen.getAllByTestId('footer-link-separator');
      expect(separators).toHaveLength(mockLinks.length - 1);
    });
  });

  describe('Social Links', () => {
    it('should have correct href attributes', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      const twitterLink = screen.getByLabelText('Twitter');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/example');

      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/example');
    });

    it('should open social links in new tab', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      mockSocialLinks.forEach((link) => {
        const element = screen.getByLabelText(link.label);
        expect(element).toHaveAttribute('target', '_blank');
        expect(element).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should render platform icons', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      expect(screen.getByTestId('social-icon-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('social-icon-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('social-icon-linkedin')).toBeInTheDocument();
      expect(screen.getByTestId('social-icon-github')).toBeInTheDocument();
    });

    it('should call onClick when social link is clicked', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      const socialLinks = [
        {
          platform: 'twitter' as const,
          url: 'https://twitter.com/example',
          label: 'Twitter',
          onClick,
        },
      ];

      render(<Footer socialLinks={socialLinks} />);

      await user.click(screen.getByLabelText('Twitter'));
      expect(onClick).toHaveBeenCalled();
    });

    it('should support additional social platforms', () => {
      const customSocialLinks = [
        { platform: 'instagram' as const, url: 'https://instagram.com/example', label: 'Instagram' },
        { platform: 'youtube' as const, url: 'https://youtube.com/example', label: 'YouTube' },
      ];

      render(<Footer socialLinks={customSocialLinks} />);

      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should render in two-column layout', () => {
      render(<Footer links={mockLinks} socialLinks={mockSocialLinks} />);

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('footer');

      const container = screen.getByTestId('footer-container');
      expect(container).toHaveClass('footer-container');
    });

    it('should have footer links section', () => {
      render(<Footer links={mockLinks} />);

      expect(screen.getByTestId('footer-links')).toBeInTheDocument();
    });

    it('should have social links section', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      expect(screen.getByTestId('footer-social')).toBeInTheDocument();
    });

    it('should have copyright section', () => {
      render(<Footer />);

      expect(screen.getByTestId('footer-copyright')).toBeInTheDocument();
    });

    it('should not render footer links section when no links', () => {
      render(<Footer />);

      expect(screen.queryByTestId('footer-links')).not.toBeInTheDocument();
    });

    it('should not render social section when no social links', () => {
      render(<Footer />);

      expect(screen.queryByTestId('footer-social')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have contentinfo role', () => {
      render(<Footer />);

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have proper link labels', () => {
      render(<Footer links={mockLinks} socialLinks={mockSocialLinks} />);

      expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Twitter' })).toBeInTheDocument();
    });

    it('should have aria-label on social links', () => {
      render(<Footer socialLinks={mockSocialLinks} />);

      mockSocialLinks.forEach((link) => {
        const element = screen.getByLabelText(link.label);
        expect(element).toHaveAttribute('aria-label', link.label);
      });
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<Footer className="custom-footer" />);

      expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
    });

    it('should preserve base classes when adding custom className', () => {
      render(<Footer className="custom-footer" />);

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Dynamic Copyright Year', () => {
    it('should update year automatically', () => {
      const currentYear = new Date().getFullYear();

      render(<Footer />);

      expect(
        screen.getByText(
          `© ${currentYear} Premium Business Platform. All rights reserved.`
        )
      ).toBeInTheDocument();
    });

    it('should handle custom copyright with placeholder', () => {
      const currentYear = new Date().getFullYear();

      render(<Footer copyright={`© {{year}} My Company`} />);

      // The component should replace {{year}} with current year
      expect(screen.getByText(`© ${currentYear} My Company`)).toBeInTheDocument();
    });
  });

  describe('Multiple Link Groups', () => {
    it('should support grouped links', () => {
      const groupedLinks = [
        { label: 'Company', href: '#', isHeader: true },
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Legal', href: '#', isHeader: true },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ];

      render(<Footer links={groupedLinks} />);

      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Legal')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });

    it('should style header links differently', () => {
      const groupedLinks = [
        { label: 'Company', href: '#', isHeader: true },
        { label: 'About', href: '/about' },
      ];

      render(<Footer links={groupedLinks} />);

      const headerLink = screen.getByText('Company').closest('a');
      const regularLink = screen.getByText('About').closest('a');

      expect(headerLink).toHaveClass('footer-link-header');
      expect(regularLink).not.toHaveClass('footer-link-header');
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive container class', () => {
      render(<Footer links={mockLinks} socialLinks={mockSocialLinks} />);

      const container = screen.getByTestId('footer-container');
      expect(container).toHaveClass('footer-container');
    });

    it('should stack sections on mobile', () => {
      render(<Footer links={mockLinks} socialLinks={mockSocialLinks} />);

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('footer');
    });
  });

  describe('Link Validation', () => {
    it('should handle empty href gracefully', () => {
      const links = [{ label: 'No Link', href: '' }];

      render(<Footer links={links} />);

      const link = screen.getByText('No Link').closest('a');
      expect(link).toHaveAttribute('href', '');
    });

    it('should handle undefined href', () => {
      const links = [{ label: 'No Link', href: undefined as any }];

      render(<Footer links={links} />);

      // Should still render but without href
      expect(screen.getByText('No Link')).toBeInTheDocument();
    });

    it('should validate external URLs', () => {
      const links = [
        { label: 'External', href: 'https://example.com', target: '_blank' as const },
      ];

      render(<Footer links={links} />);

      const link = screen.getByText('External').closest('a');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Custom Content', () => {
    it('should support custom content in footer', () => {
      render(
        <Footer>
          <div data-testid="custom-content">Custom Content</div>
        </Footer>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should render custom content alongside default sections', () => {
      render(
        <Footer links={mockLinks}>
          <div data-testid="custom-content">Custom</div>
        </Footer>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of links efficiently', () => {
      const manyLinks = Array.from({ length: 50 }, (_, i) => ({
        label: `Link ${i + 1}`,
        href: `/link-${i + 1}`,
      }));

      render(<Footer links={manyLinks} />);

      expect(screen.getByText('Link 1')).toBeInTheDocument();
      expect(screen.getByText('Link 50')).toBeInTheDocument();
    });

    it('should handle large number of social links', () => {
      const manySocialLinks = Array.from({ length: 10 }, (_, i) => ({
        platform: 'twitter' as const,
        url: `https://twitter.com/example${i}`,
        label: `Twitter ${i + 1}`,
      }));

      render(<Footer socialLinks={manySocialLinks} />);

      expect(screen.getByLabelText('Twitter 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter 10')).toBeInTheDocument();
    });
  });
});
