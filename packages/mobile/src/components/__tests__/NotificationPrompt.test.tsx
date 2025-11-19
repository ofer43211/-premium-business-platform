/**
 * Tests for NotificationPrompt Component (React Native)
 * Coverage: Permission flow, error handling, platform-specific behavior
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { NotificationPrompt } from '../NotificationPrompt';

describe('NotificationPrompt', () => {
  const mockCallbacks = {
    onAccept: jest.fn(),
    onDecline: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render prompt with title and description', () => {
      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      expect(getByTestId('notification-prompt')).toBeTruthy();
      expect(getByTestId('prompt-title')).toBeTruthy();
      expect(getByTestId('prompt-description')).toBeTruthy();
    });

    it('should display correct button labels', () => {
      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      expect(getByTestId('accept-button')).toBeTruthy();
      expect(getByTestId('decline-button')).toBeTruthy();
    });

    it('should show help text on iOS', () => {
      Platform.OS = 'ios';

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      expect(getByTestId('help-text')).toBeTruthy();
    });

    it('should not show help text on Android', () => {
      Platform.OS = 'android';

      const { queryByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      expect(queryByTestId('help-text')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onAccept and onClose when accept button is pressed', async () => {
      mockCallbacks.onAccept.mockResolvedValue(undefined);

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(mockCallbacks.onAccept).toHaveBeenCalled();
        expect(mockCallbacks.onClose).toHaveBeenCalled();
      });
    });

    it('should call onDecline and onClose when decline button is pressed', () => {
      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('decline-button'));

      expect(mockCallbacks.onDecline).toHaveBeenCalled();
      expect(mockCallbacks.onClose).toHaveBeenCalled();
    });

    it('should disable buttons while loading', async () => {
      let resolveAccept: () => void;
      mockCallbacks.onAccept.mockImplementation(
        () => new Promise(resolve => { resolveAccept = resolve as () => void; })
      );

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(getByTestId('accept-button')).toBeDisabled();
        expect(getByTestId('decline-button')).toBeDisabled();
      });

      resolveAccept!();
    });

    it('should show loading text while requesting permission', async () => {
      let resolveAccept: () => void;
      mockCallbacks.onAccept.mockImplementation(
        () => new Promise(resolve => { resolveAccept = resolve as () => void; })
      );

      const { getByTestId, getByText } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(getByText('Requesting...')).toBeTruthy();
      });

      resolveAccept!();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when onAccept fails', async () => {
      const errorMessage = 'Permission denied by user';
      mockCallbacks.onAccept.mockRejectedValue(new Error(errorMessage));

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        const errorElement = getByTestId('error-message');
        expect(errorElement).toBeTruthy();
        expect(errorElement.props.children).toBe(errorMessage);
      });
    });

    it('should handle non-Error objects in catch block', async () => {
      mockCallbacks.onAccept.mockRejectedValue('String error');

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        const errorElement = getByTestId('error-message');
        expect(errorElement.props.children).toBe('Permission denied');
      });
    });

    it('should not close prompt when error occurs', async () => {
      mockCallbacks.onAccept.mockRejectedValue(new Error('Failed'));

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });

      expect(mockCallbacks.onClose).not.toHaveBeenCalled();
    });

    it('should clear error when retrying', async () => {
      mockCallbacks.onAccept
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined);

      const { getByTestId, queryByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      // First attempt - should show error
      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });

      // Second attempt - error should be cleared
      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(queryByTestId('error-message')).toBeNull();
      });
    });
  });

  describe('Platform-specific Behavior', () => {
    it('should handle iOS-specific permission flow', async () => {
      Platform.OS = 'ios';
      mockCallbacks.onAccept.mockResolvedValue(undefined);

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(mockCallbacks.onAccept).toHaveBeenCalled();
      });
    });

    it('should handle Android-specific permission flow', async () => {
      Platform.OS = 'android';
      mockCallbacks.onAccept.mockResolvedValue(undefined);

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(mockCallbacks.onAccept).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have testID for all interactive elements', () => {
      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      expect(getByTestId('notification-prompt')).toBeTruthy();
      expect(getByTestId('accept-button')).toBeTruthy();
      expect(getByTestId('decline-button')).toBeTruthy();
    });

    it('should have proper button states', () => {
      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      const acceptButton = getByTestId('accept-button');
      const declineButton = getByTestId('decline-button');

      expect(acceptButton).not.toBeDisabled();
      expect(declineButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', async () => {
      mockCallbacks.onAccept.mockResolvedValue(undefined);

      const { getByTestId } = render(<NotificationPrompt {...mockCallbacks} />);

      const button = getByTestId('accept-button');

      // Click multiple times rapidly
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      await waitFor(() => {
        expect(mockCallbacks.onAccept).toHaveBeenCalledTimes(1);
      });
    });

    it('should maintain state across re-renders', async () => {
      mockCallbacks.onAccept.mockRejectedValue(new Error('Test error'));

      const { getByTestId, rerender } = render(<NotificationPrompt {...mockCallbacks} />);

      fireEvent.press(getByTestId('accept-button'));

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });

      // Re-render with same props
      rerender(<NotificationPrompt {...mockCallbacks} />);

      expect(getByTestId('error-message')).toBeTruthy();
    });
  });
});
