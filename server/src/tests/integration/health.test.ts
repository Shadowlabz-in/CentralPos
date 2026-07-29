describe('Health API', () => {
  const baseUrl = 'http://localhost:4000/api';

  it('should return OK status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('OK');
    expect(data.message).toBe('Central One POS API Running');
  });
});
