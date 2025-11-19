/**
 * Tests for useZodForm hook
 * Coverage: Zod integration, validation, error handling
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { useZodForm, getFieldError, hasFieldError } from '../hooks/useZodForm';

describe('useZodForm', () => {
  const testSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    age: z.number().min(18, 'Must be at least 18'),
  });

  describe('Hook initialization', () => {
    it('should initialize form with default values', () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'test@example.com',
            password: 'password123',
            age: 25,
          },
        })
      );

      expect(result.current.getValues()).toEqual({
        email: 'test@example.com',
        password: 'password123',
        age: 25,
      });
    });

    it('should initialize without default values', () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
        })
      );

      expect(result.current.getValues()).toEqual({
        email: undefined,
        password: undefined,
        age: undefined,
      });
    });
  });

  describe('Validation', () => {
    it('should validate valid data', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'valid@example.com',
            password: 'validpassword',
            age: 25,
          },
        })
      );

      let isValid = false;
      await act(async () => {
        isValid = await result.current.trigger();
      });

      expect(isValid).toBe(true);
      expect(result.current.formState.errors).toEqual({});
    });

    it('should show validation errors for invalid email', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'invalid-email',
            password: 'validpassword',
            age: 25,
          },
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.formState.errors.email?.message).toBe('Invalid email');
    });

    it('should show validation errors for short password', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'valid@example.com',
            password: 'short',
            age: 25,
          },
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.formState.errors.password?.message).toBe(
        'Password must be at least 8 characters'
      );
    });

    it('should show validation errors for underage', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'valid@example.com',
            password: 'validpassword',
            age: 16,
          },
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.formState.errors.age?.message).toBe('Must be at least 18');
    });

    it('should validate multiple fields with errors', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'invalid',
            password: 'short',
            age: 10,
          },
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.formState.errors).toHaveProperty('email');
      expect(result.current.formState.errors).toHaveProperty('password');
      expect(result.current.formState.errors).toHaveProperty('age');
    });
  });

  describe('Form submission', () => {
    it('should call onSubmit with valid data', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'valid@example.com',
            password: 'validpassword',
            age: 25,
          },
        })
      );

      await act(async () => {
        await result.current.handleSubmit(onSubmit)();
      });

      expect(onSubmit).toHaveBeenCalledWith(
        {
          email: 'valid@example.com',
          password: 'validpassword',
          age: 25,
        },
        expect.any(Object)
      );
    });

    it('should not call onSubmit with invalid data', async () => {
      const onSubmit = jest.fn();
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'invalid',
            password: 'short',
            age: 10,
          },
        })
      );

      await act(async () => {
        await result.current.handleSubmit(onSubmit)();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Field updates', () => {
    it('should update field value', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'old@example.com',
            password: 'password123',
            age: 25,
          },
        })
      );

      await act(async () => {
        result.current.setValue('email', 'new@example.com');
      });

      expect(result.current.getValues('email')).toBe('new@example.com');
    });

    it('should validate on field change when mode is onChange', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          mode: 'onChange',
          defaultValues: {
            email: 'valid@example.com',
            password: 'password123',
            age: 25,
          },
        })
      );

      await act(async () => {
        result.current.setValue('email', 'invalid', { shouldValidate: true });
      });

      await waitFor(() => {
        expect(result.current.formState.errors.email?.message).toBe('Invalid email');
      });
    });
  });

  describe('Reset functionality', () => {
    it('should reset form to default values', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'initial@example.com',
            password: 'initial123',
            age: 25,
          },
        })
      );

      await act(async () => {
        result.current.setValue('email', 'changed@example.com');
        result.current.setValue('password', 'changed123');
      });

      expect(result.current.getValues('email')).toBe('changed@example.com');

      await act(async () => {
        result.current.reset();
      });

      expect(result.current.getValues()).toEqual({
        email: 'initial@example.com',
        password: 'initial123',
        age: 25,
      });
    });

    it('should clear errors on reset', async () => {
      const { result } = renderHook(() =>
        useZodForm({
          schema: testSchema,
          defaultValues: {
            email: 'invalid',
            password: 'short',
            age: 10,
          },
        })
      );

      await act(async () => {
        await result.current.trigger();
      });

      expect(Object.keys(result.current.formState.errors).length).toBeGreaterThan(0);

      await act(async () => {
        result.current.reset({
          email: 'valid@example.com',
          password: 'validpassword',
          age: 25,
        });
      });

      expect(result.current.formState.errors).toEqual({});
    });
  });
});

describe('Helper functions', () => {
  describe('getFieldError', () => {
    it('should get top-level field error', () => {
      const errors = {
        email: { message: 'Invalid email' },
      };

      expect(getFieldError(errors, 'email')).toBe('Invalid email');
    });

    it('should get nested field error', () => {
      const errors = {
        user: {
          address: {
            street: { message: 'Street is required' },
          },
        },
      };

      expect(getFieldError(errors, 'user.address.street')).toBe('Street is required');
    });

    it('should return undefined for non-existent field', () => {
      const errors = {
        email: { message: 'Invalid email' },
      };

      expect(getFieldError(errors, 'password')).toBeUndefined();
    });

    it('should return undefined for empty errors', () => {
      expect(getFieldError({}, 'email')).toBeUndefined();
    });
  });

  describe('hasFieldError', () => {
    it('should return true when field has error', () => {
      const errors = {
        email: { message: 'Invalid email' },
      };

      expect(hasFieldError(errors, 'email')).toBe(true);
    });

    it('should return false when field has no error', () => {
      const errors = {
        email: { message: 'Invalid email' },
      };

      expect(hasFieldError(errors, 'password')).toBe(false);
    });

    it('should work with nested fields', () => {
      const errors = {
        user: {
          address: {
            street: { message: 'Required' },
          },
        },
      };

      expect(hasFieldError(errors, 'user.address.street')).toBe(true);
      expect(hasFieldError(errors, 'user.address.city')).toBe(false);
    });
  });
});
