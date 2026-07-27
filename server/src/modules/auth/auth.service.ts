import crypto from 'crypto';
import { userRepository } from '../user/user.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config';
import { auth as firebaseAuth, firestore } from '../../lib/firebase-admin';
import { getPermissionsForRoles } from '../../config/permissions';

function parseJwtExpiresIn(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

async function getFirestoreUser(email: string) {
  try {
    const snap = await firestore.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as any;
  } catch {
    return null;
  }
}

async function upsertFirestoreUser(email: string, data: {
  firstName: string;
  lastName?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  customPermissions?: string[];
  storeId?: string | null;
  uid?: string;
}) {
  try {
    const existing = await getFirestoreUser(email);
    const now = new Date();
    const payload = {
      ...data,
      isActive: true,
      isEmailVerified: true,
      preferences: { theme: 'dark', language: 'en', defaultLandingPage: '/catalogue', itemsPerPage: 20 },
      notificationSettings: { lowStockAlert: true, outOfStockAlert: true, dailySalesSummary: false, emailEnabled: false, smsEnabled: false },
      storeIds: data.storeId ? [data.storeId] : [],
      primaryStoreId: data.storeId || null,
      metadata: {
        lastLoginAt: now,
        loginCount: existing ? (existing.metadata?.loginCount || 0) + 1 : 1,
        createdAt: existing ? existing.metadata?.createdAt : now,
        updatedAt: now,
      },
      updatedAt: now,
    };

    if (existing) {
      await firestore.collection('users').doc(existing.id).update(payload);
      return { id: existing.id, ...payload };
    }

    const ref = await firestore.collection('users').add({
      ...payload,
      createdAt: now,
      metadata: {
        lastLoginAt: now,
        loginCount: 1,
        createdBy: null,
        createdAt: now,
        updatedAt: now,
      },
    });
    return { id: ref.id, ...payload };
  } catch {
    return null;
  }
}

function buildUserResponse(prismaUser: any, roles: string[], permissions: string[]) {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    phone: prismaUser.phone,
    roles,
    permissions,
    isActive: prismaUser.isActive,
    storeId: prismaUser.storeId,
  };
}

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

    let prismaUser = await userRepository.findByEmail(email);

    if (!prismaUser) {
      const roleName = 'CASHIER';
      const role = await userRepository.findRoleByName(roleName);
      if (!role) throw new AppError(`Role ${roleName} not found`, 500);

      prismaUser = await userRepository.create({
        email,
        passwordHash: '',
        firstName: decoded.name || email.split('@')[0],
      });

      await userRepository.assignRole(prismaUser.id, role.id);
      prismaUser = await userRepository.findByEmail(email);
    }

    if (!prismaUser || !prismaUser.isActive) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }

    // -- Firestore role resolution --
    const fsUser = await getFirestoreUser(email);

    let roles: string[];
    let permissions: string[];
    let customPerms: string[];

    if (fsUser && fsUser.roles && fsUser.roles.length > 0) {
      // Firestore is authoritative
      roles = fsUser.roles;
      customPerms = fsUser.customPermissions || [];
      permissions = fsUser.permissions || getPermissionsForRoles(roles, customPerms);
    } else {
      // Fall back to Prisma roles, then persist to Firestore
      roles = prismaUser.userRoles.map((ur: any) => ur.role.name);
      customPerms = (prismaUser as any).customPermissions || [];
      permissions = getPermissionsForRoles(roles, customPerms);
      await upsertFirestoreUser(email, {
        firstName: prismaUser.firstName,
        lastName: prismaUser.lastName || undefined,
        phone: prismaUser.phone || undefined,
        roles,
        customPermissions: customPerms,
        permissions,
        storeId: prismaUser.storeId,
        uid: decoded.uid,
      });
    }

    const jwtPayload = {
      userId: prismaUser.id,
      email: prismaUser.email,
      roles,
      permissions: customPerms,
      storeId: prismaUser.storeId || undefined,
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    const expiresAt = new Date(Date.now() + parseJwtExpiresIn(config.jwt.refreshExpiresIn));

    await userRepository.createRefreshToken({
      token: refreshToken,
      userId: prismaUser.id,
      expiresAt,
    });

    return (() => {
      console.log('[AUTH_DEBUG] firebaseLogin result:', JSON.stringify({ email, roles, permissions }));
      return {
        accessToken,
        refreshToken,
        user: buildUserResponse(prismaUser, roles, permissions),
      };
    })();
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

    // -- Firestore role resolution --
    const fsUser = await getFirestoreUser(email);

    let roles: string[];
    let permissions: string[];

    if (fsUser && fsUser.roles && fsUser.roles.length > 0) {
      roles = fsUser.roles;
      permissions = fsUser.permissions || getPermissionsForRoles(roles);
    } else {
      roles = user.userRoles.map((ur: any) => ur.role.name);
      const customPerms = (user as any).customPermissions || [];
      permissions = getPermissionsForRoles(roles, customPerms);
      await upsertFirestoreUser(email, {
        firstName: user.firstName,
        lastName: user.lastName || undefined,
        phone: user.phone || undefined,
        roles,
        customPermissions: customPerms,
        permissions,
        storeId: user.storeId,
      });
    }

    const customPerms = user.customPermissions || [];

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions: customPerms,
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

    return (() => {
      console.log('[AUTH_DEBUG] login result:', JSON.stringify({ email, roles, permissions }));
      return {
        accessToken,
        refreshToken,
        user: buildUserResponse(user, roles, permissions),
      };
    })();
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

    const fsUser = await getFirestoreUser(user.email);
    const roles = fsUser?.roles || user.userRoles.map((ur: any) => ur.role.name);
    const customPerms = fsUser?.customPermissions || (user as any).customPermissions || [];

    const jwtPayload = {
      userId: user.id,
      email: user.email,
      roles,
      permissions: customPerms,
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

  async fixSuperAdminRole(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const role = await userRepository.findRoleByName('SUPER_ADMIN');
    if (!role) {
      throw new AppError('SUPER_ADMIN role not found', 500);
    }

    await userRepository.removeRoles(user.id);
    await userRepository.assignRole(user.id, role.id);

    return { message: `User ${email} upgraded to SUPER_ADMIN` };
  },
};
