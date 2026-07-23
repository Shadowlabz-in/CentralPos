import { z } from 'zod';

export const updateStoreSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    ownerName: z.string().optional().nullable(),
    panNumber: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    pincode: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    website: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    financialYear: z.string().optional().nullable(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    prefix: z.string().min(1).max(10).optional(),
    startingNumber: z.coerce.number().int().positive().optional(),
    receiptFooter: z.string().optional().nullable(),
    termsAndConditions: z.string().optional().nullable(),
    thankYouMessage: z.string().optional().nullable(),
  }),
});

export const updateGstSchema = z.object({
  body: z.object({
    isGstEnabled: z.boolean().optional(),
    defaultMode: z.enum(['INCLUSIVE', 'EXCLUSIVE']).optional(),
    rate0Enabled: z.boolean().optional(),
    rate5Enabled: z.boolean().optional(),
    rate12Enabled: z.boolean().optional(),
    rate18Enabled: z.boolean().optional(),
    rate28Enabled: z.boolean().optional(),
  }),
});

export const updateBarcodeSchema = z.object({
  body: z.object({
    barcodeType: z.string().optional(),
    labelWidth: z.coerce.number().int().positive().optional(),
    labelHeight: z.coerce.number().int().positive().optional(),
    labelsPerRow: z.coerce.number().int().positive().optional(),
    showPrice: z.boolean().optional(),
    showSku: z.boolean().optional(),
    showVariant: z.boolean().optional(),
  }),
});

export const updatePrinterSchema = z.object({
  body: z.object({
    printerType: z.enum(['thermal', 'a4']).optional(),
    printerName: z.string().optional().nullable(),
    paperSize: z.enum(['58mm', '80mm', 'A4']).optional(),
    margins: z.coerce.number().int().nonnegative().optional(),
    fontSize: z.coerce.number().int().positive().optional(),
    autoPrint: z.boolean().optional(),
    copies: z.coerce.number().int().positive().optional(),
  }),
});
