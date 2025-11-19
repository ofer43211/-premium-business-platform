/**
 * E2E Tests for AI Chatbot
 * Critical user journey: Start conversation -> Send messages -> Receive responses
 */
import { test, expect } from '@playwright/test';

test.describe('AI Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userId', 'test-user-123');
      localStorage.setItem('subscriptionStatus', 'active');
    });

    await page.goto('/chat');
  });

  test('should display chatbot interface', async ({ page }) => {
    await expect(page.getByTestId('chatbot-container')).toBeVisible();
    await expect(page.getByTestId('message-input')).toBeVisible();
    await expect(page.getByTestId('send-button')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');
    const sendButton = page.getByTestId('send-button');

    // Type message
    await messageInput.fill('Hello, I need help');
    await sendButton.click();

    // User message should appear
    await expect(page.getByText('Hello, I need help')).toBeVisible();

    // Wait for AI response (with loading indicator)
    await expect(page.getByTestId('typing-indicator')).toBeVisible();

    // AI response should appear
    await expect(page.getByTestId('ai-response')).toBeVisible({ timeout: 10000 });
  });

  test('should handle empty messages', async ({ page }) => {
    const sendButton = page.getByTestId('send-button');

    // Try to send empty message
    await sendButton.click();

    // Should not send (button might be disabled or show validation)
    const messages = page.getByTestId('message-list').locator('[data-role="message"]');
    await expect(messages).toHaveCount(0);
  });

  test('should display conversation history', async ({ page }) => {
    const messageInput = page.getByTestId('message-input');

    // Send multiple messages
    await messageInput.fill('First message');
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('ai-response')).toBeVisible({ timeout: 10000 });

    await messageInput.fill('Second message');
    await page.getByTestId('send-button').click();

    // Both user messages should be visible
    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
  });

  test('should handle long messages', async ({ page }) => {
    const longMessage = 'This is a very long message. '.repeat(50);

    await page.getByTestId('message-input').fill(longMessage);
    await page.getByTestId('send-button').click();

    // Message should be sent
    await expect(page.getByText(longMessage.substring(0, 50))).toBeVisible();
  });

  test('should allow creating new conversation', async ({ page }) => {
    // Send a message in current conversation
    await page.getByTestId('message-input').fill('Test message');
    await page.getByTestId('send-button').click();

    // Click new conversation button
    await page.getByTestId('new-conversation-btn').click();

    // Message history should be cleared
    const messages = page.getByTestId('message-list').locator('[data-role="message"]');
    await expect(messages).toHaveCount(0);
  });

  test('should display error on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/chat', route => {
      route.abort('failed');
    });

    await page.getByTestId('message-input').fill('Test message');
    await page.getByTestId('send-button').click();

    // Should show error message
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/error/i);
  });

  test.describe('Language Support', () => {
    test('should support Hebrew conversations', async ({ page }) => {
      // Switch to Hebrew
      await page.getByTestId('language-select').selectOption('he');

      // Check RTL
      const dir = await page.evaluate(() => document.documentElement.dir);
      expect(dir).toBe('rtl');

      // Send Hebrew message
      await page.getByTestId('message-input').fill('שלום, אני צריך עזרה');
      await page.getByTestId('send-button').click();

      await expect(page.getByText('שלום, אני צריך עזרה')).toBeVisible();
    });

    test('should maintain language across page refresh', async ({ page }) => {
      // Switch to Hebrew
      await page.getByTestId('language-select').selectOption('he');

      // Reload page
      await page.reload();

      // Should still be in Hebrew
      const selectedLang = await page.getByTestId('language-select').inputValue();
      expect(selectedLang).toBe('he');
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should work on mobile devices', async ({ page }) => {
      await expect(page.getByTestId('chatbot-container')).toBeVisible();

      // Send message on mobile
      await page.getByTestId('message-input').fill('Mobile test');
      await page.getByTestId('send-button').click();

      await expect(page.getByText('Mobile test')).toBeVisible();
    });

    test('should handle keyboard on mobile', async ({ page }) => {
      const messageInput = page.getByTestId('message-input');

      // Focus input
      await messageInput.focus();

      // Input should be visible above keyboard
      await expect(messageInput).toBeInViewport();
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab to input
      await page.keyboard.press('Tab');

      // Type message
      await page.keyboard.type('Keyboard navigation test');

      // Tab to send button and press Enter
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      await expect(page.getByText('Keyboard navigation test')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.getByTestId('message-input')).toHaveAttribute('aria-label');
      await expect(page.getByTestId('send-button')).toHaveAttribute('aria-label');
    });
  });
});
