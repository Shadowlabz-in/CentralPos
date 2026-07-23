import prisma from './prisma';

function generateNumericSuffix(length = 6): string {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
}

export async function generateSku(
  productName: string,
  size?: string,
  color?: string,
): Promise<string> {
  const prefix = productName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((w) => w.slice(0, 3).toUpperCase())
    .filter(Boolean)
    .slice(0, 3)
    .join('-');

  const suffix = [size ? size.toUpperCase() : '', color ? color.toUpperCase().slice(0, 3) : '']
    .filter(Boolean)
    .join('-');

  const base = [prefix, suffix, generateNumericSuffix()].filter(Boolean).join('-');

  let sku = base;
  let attempts = 0;
  while (await prisma.productVariant.findFirst({ where: { sku, deletedAt: null } })) {
    sku = `${base}-${generateNumericSuffix(3)}`;
    attempts++;
    if (attempts > 10) {
      sku = `${prefix}-${Date.now().toString(36).toUpperCase()}-${generateNumericSuffix(3)}`;
      break;
    }
  }

  return sku;
}

export async function generateBarcode(): Promise<string> {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString().slice(2, 6);
  let barcode = `K${timestamp}${random}`.slice(0, 14);

  let attempts = 0;
  while (await prisma.productVariant.findFirst({ where: { barcode, deletedAt: null } })) {
    barcode =
      `K${Date.now().toString(36).toUpperCase()}${Math.random().toString().slice(2, 6)}`.slice(
        0,
        14,
      );
    attempts++;
    if (attempts > 10) {
      barcode = `K${Date.now()}${Math.random().toString().slice(2, 5)}`.slice(0, 14);
      break;
    }
  }

  return barcode;
}
