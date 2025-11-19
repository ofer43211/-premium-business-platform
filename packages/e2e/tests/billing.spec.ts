/**
 * E2E Tests for Billing Flow
 * Critical user journey: Sign up -> Subscribe -> Payment
 */
import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to app
    await page.goto('/');
  });

  test('should display subscription plans', async ({ page }) => {
    await page.goto('/pricing');

    // Check that plans are displayed
    await expect(page.getByTestId('available-plans')).toBeVisible();
    await expect(page.getByTestId('plan-basic')).toBeVisible();
    await expect(page.getByTestId('plan-pro')).toBeVisible();

    // Verify pricing information
    const basicPlan = page.getByTestId('plan-basic');
    await expect(basicPlan).toContainText('9.99');
    await expect(basicPlan).toContainText('USD');
  });

  test('should initiate subscription flow', async ({ page }) => {
    await page.goto('/pricing');

    // Click subscribe button
    await page.getByTestId('subscribe-pro').click();

    // Should redirect to auth if not logged in
    await expect(page).toHaveURL(/.*login/);
  });

  test('authenticated user can subscribe to plan', async ({ page }) => {
    // Mock authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'test-user-123');
    });

    await page.goto('/pricing');

    // Click subscribe button
    await page.getByTestId('subscribe-pro').click();

    // Should see payment form
    await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible();
    await expect(page.getByLabel(/card number/i)).toBeVisible();
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'test-user-123');
    });

    await page.goto('/pricing');
    await page.getByTestId('subscribe-basic').click();

    // Fill invalid payment details
    await page.getByLabel(/card number/i).fill('4000000000000002'); // Test card that fails
    await page.getByLabel(/expiry/i).fill('12/25');
    await page.getByLabel(/cvc/i).fill('123');

    // Submit payment
    await page.getByRole('button', { name: /pay/i }).click();

    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/payment/i);
  });

  test('should show subscription status for subscribed users', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'subscribed-user-123');
      localStorage.setItem('subscriptionStatus', 'active');
    });

    await page.goto('/account/billing');

    // Should see current plan
    await expect(page.getByTestId('current-plan')).toBeVisible();
    await expect(page.getByTestId('current-plan')).toContainText('Pro');

    // Should see management options
    await expect(page.getByTestId('update-payment-btn')).toBeVisible();
    await expect(page.getByTestId('cancel-subscription-btn')).toBeVisible();
  });

  test('should allow cancelling subscription', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'subscribed-user-123');
      localStorage.setItem('subscriptionStatus', 'active');
    });

    await page.goto('/account/billing');

    // Click cancel button
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('cancel');
      dialog.accept();
    });

    await page.getByTestId('cancel-subscription-btn').click();

    // Should show confirmation
    await expect(page.getByText(/subscription cancelled/i)).toBeVisible();
  });

  test.describe('RTL Support', () => {
    test.use({ locale: 'he-IL' });

    test('should display billing page in RTL', async ({ page }) => {
      await page.goto('/pricing');

      // Check document direction
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('rtl');

      // Plans should still be visible
      await expect(page.getByTestId('available-plans')).toBeVisible();
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display pricing on mobile', async ({ page }) => {
      await page.goto('/pricing');

      // Plans should be stacked vertically on mobile
      await expect(page.getByTestId('plan-basic')).toBeVisible();
      await expect(page.getByTestId('plan-pro')).toBeVisible();
    });
  });
});
