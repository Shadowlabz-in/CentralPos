import prisma from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

describe('Auth API', () => {
  const baseUrl = 'http://localhost:4000/api';

  beforeAll(async () => {
    const store = await prisma.store.findFirst();
    if (store) {
      const hashedPwd = await hashPassword('test123');
      await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
          email: 'test@test.com',
          passwordHash: hashedPwd,
          firstName: 'Test',
          lastName: 'User',
          storeId: store.id,
          isActive: true,
          userRoles: {
            create: { role: { connect: { name: 'CASHIER' } } },
          },
        },
      });
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@test.com' } });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid admin credentials', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@centralone.com', password: 'admin123' }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.message).toBe('Login successful');
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe('admin@centralone.com');
    });

    it('should login successfully with valid cashier credentials', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'cashier@centralone.com', password: 'cashier123' }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.accessToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@centralone.com', password: 'wrongpassword' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.status).toBe('error');
    });

    it('should reject non-existent email', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@test.com', password: 'test123' }),
      });
      expect(res.status).toBe(401);
    });

    it('should reject missing fields', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@centralone.com' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@centralone.com', password: 'admin123' }),
      });
      const loginData = await loginRes.json();
      const refreshToken = loginData.data.refreshToken;

      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid-refresh-token' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@centralone.com', password: 'admin123' }),
      });
      const loginData = await loginRes.json();

      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginData.data.accessToken}`,
        },
        body: JSON.stringify({ refreshToken: loginData.data.refreshToken }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.message).toBe('Logout successful');
    });

    it('should reject logout without token', async () => {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should reject change-password without authentication', async () => {
      const res = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: 'admin123', newPassword: 'newpass123' }),
      });
      expect(res.status).toBe(401);
    });
  });
});
