/**
 * Footer Component
 * Page footer with links and copyright
 */
import React from 'react';

export interface FooterLink {
  label: string;
  href: string;
  onClick?: () => void;
}

export interface FooterProps {
  /** Copyright text */
  copyright?: string;
  /** Footer links */
  links?: FooterLink[];
  /** Social media links */
  socialLinks?: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  /** Custom className */
  className?: string;
}

export function Footer({
  copyright,
  links = [],
  socialLinks = [],
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} Premium Business Platform. All rights reserved.`;

  return (
    <footer className={`footer ${className}`} data-testid="footer">
      <div className="footer-container">
        {/* Links */}
        {links.length > 0 && (
          <nav className="footer-links" data-testid="footer-links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
                className="footer-link"
                data-testid={`footer-link-${index}`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="footer-social" data-testid="footer-social">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="footer-social-link"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-social-${index}`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="footer-copyright" data-testid="footer-copyright">
          {copyright || defaultCopyright}
        </div>
      </div>
    </footer>
  );
}
