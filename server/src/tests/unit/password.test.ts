import { hashPassword, comparePassword } from '../../utils/password';

describe('Password Utils', () => {
  it('should hash a password', async () => {
    const hash = await hashPassword('test123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('test123');
  });

  it('should compare correct password', async () => {
    const hash = await hashPassword('test123');
    const match = await comparePassword('test123', hash);
    expect(match).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('test123');
    const match = await comparePassword('wrong', hash);
    expect(match).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const hash1 = await hashPassword('test123');
    const hash2 = await hashPassword('test123');
    expect(hash1).not.toBe(hash2);
  });
});
