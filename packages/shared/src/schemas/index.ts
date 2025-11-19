/**
 * Shared Validation Schemas using Zod
 * Used across web, mobile, and API packages
 */
import { z } from 'zod';

// =====================
// User Schemas
// =====================

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const userNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .trim();

export const userSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: userNameSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  name: userNameSchema.optional(),
  email: emailSchema.optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  language: z.enum(['en', 'he', 'ar']).optional(),
  timezone: z.string().optional(),
});

// =====================
// Subscription Schemas
// =====================

export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ILS']),
  interval: z.enum(['month', 'year']),
  features: z.array(z.string()),
});

export const paymentMethodSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, 'Invalid card number')
    .transform((val) => val.replace(/\s/g, '')),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  holderName: z.string().min(3, 'Card holder name is required'),
});

// =====================
// Chatbot Schemas
// =====================

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)')
    .trim(),
  language: z.enum(['en', 'he', 'ar']).optional(),
});

export const conversationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
      timestamp: z.number(),
    })
  ),
  language: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// =====================
// A/B Testing Schemas
// =====================

export const experimentVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().min(0).max(100),
  config: z.record(z.any()).optional(),
});

export const targetingRuleSchema = z.object({
  type: z.enum(['language', 'subscription', 'country', 'custom']),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in']),
  value: z.any(),
});

export const createExperimentSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    variants: z
      .array(experimentVariantSchema)
      .min(2, 'At least 2 variants required'),
    startDate: z.number(),
    endDate: z.number().optional(),
    targetingRules: z.array(targetingRuleSchema).optional(),
  })
  .refine(
    (data) => {
      const totalWeight = data.variants.reduce((sum, v) => sum + v.weight, 0);
      return totalWeight === 100;
    },
    {
      message: 'Variant weights must sum to 100',
      path: ['variants'],
    }
  );

export const conversionEventSchema = z.object({
  experimentId: z.string(),
  eventName: z.string().min(1),
  value: z.number().optional(),
});

// =====================
// Push Notification Schemas
// =====================

export const notificationPayloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  data: z.record(z.string()).optional(),
});

export const notificationOptionsSchema = z.object({
  priority: z.enum(['high', 'normal']).optional(),
  sound: z.string().optional(),
  badge: z.number().int().positive().optional(),
  clickAction: z.string().url().optional(),
  tag: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export const scheduleNotificationSchema = z.object({
  userId: z.string(),
  notification: notificationPayloadSchema,
  scheduledFor: z.number().refine((val) => val > Date.now(), {
    message: 'Scheduled time must be in the future',
  }),
  options: notificationOptionsSchema.optional(),
});

export const deviceTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().min(1),
});

// =====================
// Common Schemas
// =====================

export const idSchema = z.string().min(1);

export const timestampSchema = z.number().int().positive();

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// =====================
// Type Exports
// =====================

export type UserSignup = z.infer<typeof userSignupSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;

export type ExperimentVariant = z.infer<typeof experimentVariantSchema>;
export type TargetingRule = z.infer<typeof targetingRuleSchema>;
export type CreateExperiment = z.infer<typeof createExperimentSchema>;
export type ConversionEvent = z.infer<typeof conversionEventSchema>;

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>;
export type ScheduleNotification = z.infer<typeof scheduleNotificationSchema>;
export type DeviceToken = z.infer<typeof deviceTokenSchema>;

export type Pagination = z.infer<typeof paginationSchema>;
export type Sort = z.infer<typeof sortSchema>;

// =====================
// Validation Helpers
// =====================

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
  };
}

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 20;
  if (password.length >= 16) score += 10;

  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters');
  }

  return { score, feedback };
}
