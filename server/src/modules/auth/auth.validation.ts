import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'New password must be at least 6 characters'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
});
