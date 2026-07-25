import crypto from 'crypto';
import { userRepository } from '../user/user.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';
import { getPermissionsForRoles } from '../../config/permissions';
import { auth as firebaseAuth } from '../../lib/firebase-admin';

function parseJwtExpiresIn(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'm':
      return value * 60 * 1000;
    case 's':
      return value * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

const DEFAULT_FIREBASE_ROLE = 'CASHIER';

export const authService = {
  async firebaseLogin(idToken: string) {
    let decoded;
    try {
      decoded = await firebaseAuth.verifyIdToken(idToken);
    } catch {
      throw new AppError('Invalid Firebase token', 401);
    }

    const email = decoded.email;
    if (!email) {
      throw new AppError('Firebase account must have an email address', 400);
    }

    let user = await userRepository.findByEmail(email);

    if (!user) {
      const role = await userRepository.findRoleByName(DEFAULT_FIREBASE_ROLE);
      if (!role) throw new AppError('Default role not found', 500);

      user = await userRepository.create({
        email,
        passwordHash: '',
        firstName: decoded.name || email.split('@')[0],
      });

      await userRepository.assignRole(user.id, role.id);
      user = await userRepository.findByEmail(email);
    }

    if (!user || !user.isActive) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
      storeId: user.storeId || undefined,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    const expiresAt = new Date(Date.now() + parseJwtExpiresIn(config.jwt.refreshExpiresIn));

    await userRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    const permissions = getPermissionsForRoles(roles);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles,
        permissions,
        isActive: user.isActive,
        storeId: user.storeId,
      },
    };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
      storeId: user.storeId || undefined,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    const expiresAt = new Date(Date.now() + parseJwtExpiresIn(config.jwt.refreshExpiresIn));

    await userRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    const permissions = getPermissionsForRoles(roles);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles,
        permissions,
        isActive: user.isActive,
        storeId: user.storeId,
      },
    };
  },

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await userRepository.deleteRefreshToken(refreshToken);
    } else {
      await userRepository.deleteUserRefreshTokens(userId);
    }
  },

  async refreshAccessToken(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const storedToken = await userRepository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new AppError('Refresh token has been revoked', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await userRepository.deleteRefreshToken(refreshToken);
      throw new AppError('Refresh token has expired', 401);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
    };

    const newAccessToken = signAccessToken(jwtPayload);
    const newRefreshToken = signRefreshToken(jwtPayload);

    await userRepository.deleteRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + parseJwtExpiresIn(config.jwt.refreshExpiresIn));

    await userRepository.createRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, passwordHash);
  },
};
