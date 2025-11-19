/**
 * E2E Tests for Authentication Flow
 * Critical user journey: Signup -> Login -> Logout
 */
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete full signup flow', async ({ page }) => {
    await page.goto('/signup');

    // Fill signup form
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/password/i).fill('SecurePassword123!');
    await page.getByLabel(/confirm password/i).fill('SecurePassword123!');
    await page.getByLabel(/full name/i).fill('Test User');

    // Accept terms
    await page.getByRole('checkbox', { name: /terms/i }).check();

    // Submit
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to email verification or dashboard
    await expect(page).toHaveURL(/\/(verify-email|dashboard)/);
  });

  test('should validate signup form', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit without filling
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/signup');

    const passwordInput = page.getByLabel(/^password$/i);

    // Weak password
    await passwordInput.fill('weak');
    await expect(page.getByText(/password must be/i)).toBeVisible();

    // Strong password
    await passwordInput.fill('StrongPass123!');
    await expect(page.getByText(/strong password/i)).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Mock API or use test account
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Should be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Should show error
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password
    await page.getByRole('link', { name: /forgot password/i }).click();

    await expect(page).toHaveURL('/reset-password');

    // Enter email
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Should show success message
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Mock logged in state
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'test-user-123');
    });

    await page.goto('/dashboard');

    // Open user menu
    await page.getByTestId('user-menu').click();

    // Click logout
    await page.getByRole('menuitem', { name: /log out/i }).click();

    // Should be logged out and redirected
    await expect(page).toHaveURL('/login');

    // Token should be cleared
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
  });

  test('should remember me functionality', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('checkbox', { name: /remember me/i }).check();
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL('/dashboard');

    // Close and reopen browser (simulated with context)
    await page.context().close();
    const newContext = await page.context().browser()!.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('/');

    // Should still be logged in
    await expect(newPage).toHaveURL('/dashboard');

    await newContext.close();
  });

  test('should handle session expiration', async ({ page }) => {
    // Mock expired session
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'expired-token');
      localStorage.setItem('tokenExpiry', String(Date.now() - 3600000)); // Expired 1 hour ago
    });

    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/session expired/i)).toBeVisible();
  });

  test.describe('Social Login', () => {
    test('should initiate Google login', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('button', { name: /continue with google/i }).click();

      // Should redirect to Google OAuth
      await page.waitForURL(/accounts\.google\.com/);
    });

    test('should handle OAuth callback', async ({ page }) => {
      // Simulate OAuth callback
      await page.goto('/auth/callback?provider=google&code=mock-code');

      // Should process and redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Multi-factor Authentication', () => {
    test('should prompt for 2FA when enabled', async ({ page }) => {
      await page.goto('/login');

      await page.getByLabel(/email/i).fill('user-with-2fa@example.com');
      await page.getByLabel(/password/i).fill('Password123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Should show 2FA prompt
      await expect(page.getByText(/enter verification code/i)).toBeVisible();
      await expect(page.getByLabel(/code/i)).toBeVisible();
    });

    test('should verify 2FA code', async ({ page }) => {
      // Navigate to 2FA page (after password login)
      await page.goto('/login/2fa');

      await page.getByLabel(/code/i).fill('123456');
      await page.getByRole('button', { name: /verify/i }).click();

      // Should complete login
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Mock authenticated state
      await page.addInitScript(() => {
        localStorage.setItem('authToken', 'valid-token');
        localStorage.setItem('userId', 'test-user-123');
      });

      await page.goto('/dashboard');

      // Should access the page
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/settings/profile');

      // Should redirect to login with return URL
      await expect(page).toHaveURL(/login.*redirect/);

      // Login
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('TestPassword123!');
      await page.getByRole('button', { name: /log in/i }).click();

      // Should redirect back to original page
      await expect(page).toHaveURL('/settings/profile');
    });
  });

  test.describe('Accessibility', () => {
    test('login form should be keyboard navigable', async ({ page }) => {
      await page.goto('/login');

      // Tab through form
      await page.keyboard.press('Tab'); // Email input
      await page.keyboard.type('test@example.com');

      await page.keyboard.press('Tab'); // Password input
      await page.keyboard.type('Password123!');

      await page.keyboard.press('Tab'); // Remember me checkbox
      await page.keyboard.press('Space'); // Check it

      await page.keyboard.press('Tab'); // Login button
      await page.keyboard.press('Enter'); // Submit

      // Form should be submitted
      await expect(page).not.toHaveURL('/login');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByLabel(/email/i)).toHaveAttribute('type', 'email');
      await expect(page.getByLabel(/password/i)).toHaveAttribute('type', 'password');
    });
  });
});
