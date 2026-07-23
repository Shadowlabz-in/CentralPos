describe('Settings API', () => {
  const baseUrl = 'http://localhost:4000/api';
  let adminToken: string;

  beforeAll(async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kapda.com', password: 'admin123' }),
    });
    const data = await res.json();
    adminToken = data.data.accessToken;
  });

  describe('GET /settings/store', () => {
    it('should get store settings', async () => {
      const res = await fetch(`${baseUrl}/settings/store`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.name).toBeDefined();
      expect(data.data.code).toBeDefined();
    });

    it('should reject without authentication', async () => {
      const res = await fetch(`${baseUrl}/settings/store`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /settings/invoice', () => {
    it('should get invoice settings (auto-create defaults)', async () => {
      const res = await fetch(`${baseUrl}/settings/invoice`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.prefix).toBeDefined();
      expect(data.data.startingNumber).toBeDefined();
    });
  });

  describe('PATCH /settings/invoice', () => {
    let defaultPrefix: string;

    beforeAll(async () => {
      const res = await fetch(`${baseUrl}/settings/invoice`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      defaultPrefix = data.data.prefix;
    });

    it('should update invoice settings', async () => {
      const res = await fetch(`${baseUrl}/settings/invoice`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: 'INV-TEST', receiptFooter: 'Test footer' }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.prefix).toBe('INV-TEST');
    });

    it('should restore default prefix', async () => {
      const res = await fetch(`${baseUrl}/settings/invoice`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: defaultPrefix }),
      });
      expect(res.status).toBe(200);
    });

    it('should reject update by cashier', async () => {
      const cashierRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'cashier@kapda.com', password: 'cashier123' }),
      });
      const cashierData = await cashierRes.json();

      const res = await fetch(`${baseUrl}/settings/invoice`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${cashierData.data.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: 'hacked' }),
      });
      expect(res.status).toBe(403);
    });

    it('should reject update without authentication', async () => {
      const res = await fetch(`${baseUrl}/settings/invoice`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: 'no-auth' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /settings/barcode', () => {
    it('should get barcode settings (auto-create defaults)', async () => {
      const res = await fetch(`${baseUrl}/settings/barcode`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.barcodeType).toBeDefined();
    });
  });

  describe('GET /settings/gst', () => {
    it('should get GST settings (auto-create defaults)', async () => {
      const res = await fetch(`${baseUrl}/settings/gst`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.isGstEnabled).toBeDefined();
    });
  });

  describe('GET /settings/printer', () => {
    it('should get printer settings (auto-create defaults)', async () => {
      const res = await fetch(`${baseUrl}/settings/printer`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.printerType).toBeDefined();
    });
  });
});
