import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/jwt';

describe('JWT Utils', () => {
  const payload = {
    userId: 'test-id',
    email: 'test@test.com',
    roles: ['ADMIN'],
    storeId: 'store-id',
  };

  it('should sign an access token', () => {
    const token = signAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should sign a refresh token', () => {
    const token = signRefreshToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should produce unique tokens on each call', () => {
    const token1 = signAccessToken(payload);
    const token2 = signAccessToken(payload);
    expect(token1).not.toBe(token2);
  });

  it('should verify access token', () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe('test-id');
    expect(decoded.email).toBe('test@test.com');
    expect(decoded.roles).toContain('ADMIN');
    expect(decoded.storeId).toBe('store-id');
  });

  it('should verify refresh token', () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe('test-id');
    expect(decoded.email).toBe('test@test.com');
  });

  it('should reject invalid access token', () => {
    expect(() => verifyAccessToken('invalid-token')).toThrow();
  });

  it('should reject invalid refresh token', () => {
    expect(() => verifyRefreshToken('invalid-token')).toThrow();
  });
});
