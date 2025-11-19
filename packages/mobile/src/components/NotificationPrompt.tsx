/**
 * Notification Permission Prompt Component (React Native)
 * Handles push notification permission request
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export interface NotificationPromptProps {
  onAccept: () => Promise<void>;
  onDecline: () => void;
  onClose: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  onAccept,
  onDecline,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    try {
      setLoading(true);
      setError(null);
      await onAccept();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permission denied');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  return (
    <View style={styles.container} testID="notification-prompt">
      <View style={styles.content}>
        <Text style={styles.title} testID="prompt-title">
          Enable Notifications
        </Text>
        <Text style={styles.description} testID="prompt-description">
          Stay updated with important alerts and messages from our platform.
        </Text>

        {error && (
          <Text style={styles.error} testID="error-message">
            {error}
          </Text>
        )}

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleDecline}
            disabled={loading}
            testID="decline-button"
          >
            <Text style={styles.buttonTextSecondary}>Not Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={loading}
            testID="accept-button"
          >
            <Text style={styles.buttonTextPrimary}>
              {loading ? 'Requesting...' : 'Enable'}
            </Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && (
          <Text style={styles.helpText} testID="help-text">
            You can change this in Settings later.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1976d2',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
