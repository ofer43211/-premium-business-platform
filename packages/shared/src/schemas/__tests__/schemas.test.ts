/**
 * Tests for Validation Schemas
 * Coverage: All validation rules, edge cases, error messages
 */
import {
  emailSchema,
  passwordSchema,
  userSignupSchema,
  userLoginSchema,
  changePasswordSchema,
  updateProfileSchema,
  chatMessageSchema,
  createExperimentSchema,
  notificationPayloadSchema,
  scheduleNotificationSchema,
  deviceTokenSchema,
  validateSchema,
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
} from '../index';

describe('Email Schema', () => {
  it('should validate correct emails', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
    expect(emailSchema.safeParse('user+tag@domain.co.uk').success).toBe(true);
    expect(emailSchema.safeParse('name.surname@company.com').success).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('missing@domain').success).toBe(false);
    expect(emailSchema.safeParse('@nodomain.com').success).toBe(false);
    expect(emailSchema.safeParse('spaces in@email.com').success).toBe(false);
  });

  it('should trim and lowercase emails', () => {
    const result = emailSchema.parse('  Test@EXAMPLE.COM  ');
    expect(result).toBe('test@example.com');
  });
});

describe('Password Schema', () => {
  it('should validate strong passwords', () => {
    expect(passwordSchema.safeParse('StrongP@ssw0rd').success).toBe(true);
    expect(passwordSchema.safeParse('C0mpl3x!Pass').success).toBe(true);
    expect(passwordSchema.safeParse('MyP@ssw0rd123').success).toBe(true);
  });

  it('should reject weak passwords', () => {
    const result = passwordSchema.safeParse('weak');
    expect(result.success).toBe(false);
  });

  it('should enforce minimum length', () => {
    const result = passwordSchema.safeParse('Short1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 8');
    }
  });

  it('should require uppercase letter', () => {
    const result = passwordSchema.safeParse('alllowercase1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('uppercase');
    }
  });

  it('should require lowercase letter', () => {
    const result = passwordSchema.safeParse('ALLUPPERCASE1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('lowercase');
    }
  });

  it('should require number', () => {
    const result = passwordSchema.safeParse('NoNumbers!Here');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('number');
    }
  });

  it('should require special character', () => {
    const result = passwordSchema.safeParse('NoSpecial123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('special');
    }
  });

  it('should reject too long passwords', () => {
    const tooLong = 'a'.repeat(101) + 'A1!';
    const result = passwordSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
  });
});

describe('User Signup Schema', () => {
  const validSignup = {
    email: 'test@example.com',
    password: 'StrongP@ss123',
    name: 'Test User',
    agreeToTerms: true,
  };

  it('should validate correct signup data', () => {
    expect(userSignupSchema.safeParse(validSignup).success).toBe(true);
  });

  it('should reject without email', () => {
    const { email, ...rest } = validSignup;
    expect(userSignupSchema.safeParse(rest).success).toBe(false);
  });

  it('should reject without agreeing to terms', () => {
    const signup = { ...validSignup, agreeToTerms: false };
    const result = userSignupSchema.safeParse(signup);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('terms');
    }
  });

  it('should reject short names', () => {
    const signup = { ...validSignup, name: 'A' };
    const result = userSignupSchema.safeParse(signup);
    expect(result.success).toBe(false);
  });
});

describe('User Login Schema', () => {
  it('should validate login credentials', () => {
    const login = {
      email: 'test@example.com',
      password: 'anypassword',
    };
    expect(userLoginSchema.safeParse(login).success).toBe(true);
  });

  it('should accept rememberMe option', () => {
    const login = {
      email: 'test@example.com',
      password: 'anypassword',
      rememberMe: true,
    };
    expect(userLoginSchema.safeParse(login).success).toBe(true);
  });

  it('should reject empty password', () => {
    const login = {
      email: 'test@example.com',
      password: '',
    };
    expect(userLoginSchema.safeParse(login).success).toBe(false);
  });
});

describe('Change Password Schema', () => {
  it('should validate matching passwords', () => {
    const data = {
      currentPassword: 'OldP@ss123',
      newPassword: 'NewP@ss456',
      confirmPassword: 'NewP@ss456',
    };
    expect(changePasswordSchema.safeParse(data).success).toBe(true);
  });

  it('should reject non-matching passwords', () => {
    const data = {
      currentPassword: 'OldP@ss123',
      newPassword: 'NewP@ss456',
      confirmPassword: 'Different789!',
    };
    const result = changePasswordSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("don't match");
    }
  });
});

describe('Update Profile Schema', () => {
  it('should validate phone numbers', () => {
    expect(updateProfileSchema.safeParse({ phone: '+972501234567' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ phone: '+1234567890' }).success).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(updateProfileSchema.safeParse({ phone: 'abc' }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ phone: '123' }).success).toBe(false);
  });

  it('should accept empty phone string', () => {
    expect(updateProfileSchema.safeParse({ phone: '' }).success).toBe(true);
  });

  it('should validate language codes', () => {
    expect(updateProfileSchema.safeParse({ language: 'en' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ language: 'he' }).success).toBe(true);
    expect(updateProfileSchema.safeParse({ language: 'ar' }).success).toBe(true);
  });

  it('should reject invalid language codes', () => {
    expect(updateProfileSchema.safeParse({ language: 'invalid' }).success).toBe(false);
  });
});

describe('Chat Message Schema', () => {
  it('should validate messages', () => {
    expect(chatMessageSchema.safeParse({ content: 'Hello' }).success).toBe(true);
  });

  it('should reject empty messages', () => {
    expect(chatMessageSchema.safeParse({ content: '' }).success).toBe(false);
    expect(chatMessageSchema.safeParse({ content: '   ' }).success).toBe(false);
  });

  it('should reject too long messages', () => {
    const longMessage = 'a'.repeat(4001);
    const result = chatMessageSchema.safeParse({ content: longMessage });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('too long');
    }
  });

  it('should accept maximum length messages', () => {
    const maxMessage = 'a'.repeat(4000);
    expect(chatMessageSchema.safeParse({ content: maxMessage }).success).toBe(true);
  });

  it('should trim messages', () => {
    const result = chatMessageSchema.parse({ content: '  Hello  ' });
    expect(result.content).toBe('Hello');
  });
});

describe('Create Experiment Schema', () => {
  const validExperiment = {
    name: 'Button Color Test',
    variants: [
      { id: 'a', name: 'Blue', weight: 50 },
      { id: 'b', name: 'Green', weight: 50 },
    ],
    startDate: Date.now(),
  };

  it('should validate experiments', () => {
    expect(createExperimentSchema.safeParse(validExperiment).success).toBe(true);
  });

  it('should reject experiments with invalid weight sum', () => {
    const invalid = {
      ...validExperiment,
      variants: [
        { id: 'a', name: 'Blue', weight: 60 },
        { id: 'b', name: 'Green', weight: 30 },
      ],
    };
    const result = createExperimentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('sum to 100');
    }
  });

  it('should require at least 2 variants', () => {
    const invalid = {
      ...validExperiment,
      variants: [{ id: 'a', name: 'Only', weight: 100 }],
    };
    const result = createExperimentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate three-way split', () => {
    const threeway = {
      ...validExperiment,
      variants: [
        { id: 'a', name: 'A', weight: 33 },
        { id: 'b', name: 'B', weight: 33 },
        { id: 'c', name: 'C', weight: 34 },
      ],
    };
    expect(createExperimentSchema.safeParse(threeway).success).toBe(true);
  });
});

describe('Notification Payload Schema', () => {
  it('should validate notifications', () => {
    const notification = {
      title: 'Test Notification',
      body: 'This is a test',
    };
    expect(notificationPayloadSchema.safeParse(notification).success).toBe(true);
  });

  it('should reject too long titles', () => {
    const notification = {
      title: 'a'.repeat(101),
      body: 'Body',
    };
    expect(notificationPayloadSchema.safeParse(notification).success).toBe(false);
  });

  it('should reject too long body', () => {
    const notification = {
      title: 'Title',
      body: 'a'.repeat(501),
    };
    expect(notificationPayloadSchema.safeParse(notification).success).toBe(false);
  });

  it('should validate image URLs', () => {
    const notification = {
      title: 'Title',
      body: 'Body',
      imageUrl: 'https://example.com/image.jpg',
    };
    expect(notificationPayloadSchema.safeParse(notification).success).toBe(true);
  });

  it('should reject invalid URLs', () => {
    const notification = {
      title: 'Title',
      body: 'Body',
      imageUrl: 'not-a-url',
    };
    expect(notificationPayloadSchema.safeParse(notification).success).toBe(false);
  });
});

describe('Schedule Notification Schema', () => {
  it('should validate future scheduled notifications', () => {
    const scheduled = {
      userId: 'user_123',
      notification: {
        title: 'Reminder',
        body: 'This is your reminder',
      },
      scheduledFor: Date.now() + 3600000, // 1 hour from now
    };
    expect(scheduleNotificationSchema.safeParse(scheduled).success).toBe(true);
  });

  it('should reject past scheduled times', () => {
    const scheduled = {
      userId: 'user_123',
      notification: {
        title: 'Reminder',
        body: 'This is your reminder',
      },
      scheduledFor: Date.now() - 3600000, // 1 hour ago
    };
    const result = scheduleNotificationSchema.safeParse(scheduled);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('future');
    }
  });
});

describe('Device Token Schema', () => {
  it('should validate device tokens', () => {
    const token = {
      token: 'fcm_token_abc123',
      platform: 'ios' as const,
      deviceId: 'device_123',
    };
    expect(deviceTokenSchema.safeParse(token).success).toBe(true);
  });

  it('should validate all platforms', () => {
    ['ios', 'android', 'web'].forEach(platform => {
      const token = {
        token: 'token',
        platform,
        deviceId: 'device',
      };
      expect(deviceTokenSchema.safeParse(token).success).toBe(true);
    });
  });

  it('should reject invalid platforms', () => {
    const token = {
      token: 'token',
      platform: 'invalid',
      deviceId: 'device',
    };
    expect(deviceTokenSchema.safeParse(token).success).toBe(false);
  });
});

describe('Validation Helpers', () => {
  it('validateSchema should return success with valid data', () => {
    const result = validateSchema(emailSchema, 'test@example.com');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('validateSchema should return errors with invalid data', () => {
    const result = validateSchema(emailSchema, 'invalid');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('isValidEmail should check emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  it('isValidPassword should check passwords', () => {
    expect(isValidPassword('StrongP@ss123')).toBe(true);
    expect(isValidPassword('weak')).toBe(false);
  });

  it('getPasswordStrength should calculate strength', () => {
    const weak = getPasswordStrength('weak');
    expect(weak.score).toBeLessThan(50);
    expect(weak.feedback.length).toBeGreaterThan(0);

    const strong = getPasswordStrength('VeryStr0ng!Password');
    expect(strong.score).toBeGreaterThan(70);
    expect(strong.feedback.length).toBe(0);
  });

  it('getPasswordStrength should provide feedback', () => {
    const noUppercase = getPasswordStrength('alllowercase123!');
    expect(noUppercase.feedback).toContain('Add uppercase letters');

    const noNumbers = getPasswordStrength('NoNumbers!Here');
    expect(noNumbers.feedback).toContain('Add numbers');

    const noSpecial = getPasswordStrength('NoSpecial123');
    expect(noSpecial.feedback).toContain('Add special characters');
  });
});
