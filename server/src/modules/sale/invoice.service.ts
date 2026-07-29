const PDFDocument = require('pdfkit');

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(n: any): string {
  const num = typeof n === 'string' ? parseFloat(n) : typeof n === 'number' ? n : Number(n);
  return `₹${num.toFixed(2)}`;
}

interface SaleItem {
  productVariant: {
    sku: string;
    size: string | null;
    color: string | null;
    product: { name: string };
  };
  quantity: number;
  unitPrice: any;
  gstPercentage: number;
  gstAmount: any;
  totalPrice: any;
}

interface SalePayment {
  mode: string;
  amount: any;
  reference: string | null;
}

interface SaleData {
  invoiceNumber: string;
  saleDate: Date;
  customer: { name: string; phone?: string | null; gstin?: string | null } | null;
  subtotal: any;
  discountAmount: any;
  taxAmount: any;
  grandTotal: any;
  isGst: boolean;
  items: SaleItem[];
  payments: SalePayment[];
  createdBy: { firstName: string; lastName: string | null };
}

export const invoiceService = {
  generateHtml(sale: SaleData): string {
    const itemsHtml = sale.items
      .map(
        (item) => `
        <tr>
          <td>${item.productVariant.product.name}${item.productVariant.size ? ` (${item.productVariant.size}/${item.productVariant.color || ''})` : ''}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          ${sale.isGst ? `<td>${item.gstPercentage}%</td><td>${formatCurrency(item.gstAmount)}</td>` : ''}
          <td>${formatCurrency(item.totalPrice)}</td>
        </tr>`,
      )
      .join('');

    const paymentsHtml = sale.payments
      .map(
        (p) =>
          `<tr><td>${p.mode}</td><td>${p.reference || '-'}</td><td>${formatCurrency(p.amount)}</td></tr>`,
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Invoice ${sale.invoiceNumber}</title>
<style>
  body { font-family: 'Courier New', monospace; font-size: 12px; max-width: 300px; margin: 0 auto; padding: 10px; }
  @media print { body { margin: 0; padding: 5px; } }
  .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
  .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; }
  .header p { margin: 2px 0; }
  .info { width: 100%; margin-bottom: 8px; }
  .info td { padding: 2px 0; vertical-align: top; }
  .info td:last-child { text-align: right; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  table.items th { border-bottom: 1px solid #000; padding: 4px 2px; text-align: left; font-size: 11px; }
  table.items td { padding: 3px 2px; border-bottom: 1px dotted #ccc; }
  table.items td:last-child { text-align: right; }
  table.items td:nth-child(2) { text-align: center; }
  table.items td:nth-child(3) { text-align: right; }
  .totals { width: 100%; margin-bottom: 8px; }
  .totals td { padding: 2px 0; }
  .totals td:last-child { text-align: right; }
  .totals .grand { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 4px; }
  .footer { text-align: center; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; }
</style></head>
<body>
  <div class="header">
    <h1>Central One POS</h1>
    <p>${formatDate(new Date(sale.saleDate))}</p>
    <p><strong>Invoice: ${sale.invoiceNumber}</strong></p>
  </div>
  <table class="info">
    <tr><td>Customer:</td><td>${sale.customer ? sale.customer.name : 'Walk-in Customer'}</td></tr>
    ${sale.customer?.phone ? `<tr><td>Phone:</td><td>${sale.customer.phone}</td></tr>` : ''}
    ${sale.customer?.gstin ? `<tr><td>GSTIN:</td><td>${sale.customer.gstin}</td></tr>` : ''}
    <tr><td>Cashier:</td><td>${sale.createdBy.firstName} ${sale.createdBy.lastName}</td></tr>
  </table>
  <table class="items">
    <tr><th>Item</th><th>Qty</th><th>Price</th>${sale.isGst ? '<th>GST</th><th>Tax</th>' : ''}<th>Total</th></tr>
    ${itemsHtml}
  </table>
  <table class="totals">
    <tr><td>Subtotal:</td><td>${formatCurrency(sale.subtotal)}</td></tr>
    ${Number(sale.discountAmount) > 0 ? `<tr><td>Discount:</td><td>-${formatCurrency(sale.discountAmount)}</td></tr>` : ''}
    ${sale.isGst ? `<tr><td>GST Total:</td><td>${formatCurrency(sale.taxAmount)}</td></tr>` : ''}
    <tr class="grand"><td>Grand Total:</td><td>${formatCurrency(sale.grandTotal)}</td></tr>
  </table>
  <table class="items">
    <tr><th>Payment</th><th>Ref</th><th>Amount</th></tr>
    ${paymentsHtml}
  </table>
  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p>GST: ${sale.isGst ? 'Tax Invoice' : 'Non-GST Invoice'}</p>
  </div>
  <script>window.print();</script>
</body></html>`;
  },

  async generatePdf(sale: SaleData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Central One POS', { align: 'center' });
      doc.fontSize(10).text(`Invoice: ${sale.invoiceNumber}`, { align: 'center' });
      doc.text(`Date: ${formatDate(new Date(sale.saleDate))}`, { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10);
      doc.text(`Customer: ${sale.customer ? sale.customer.name : 'Walk-in Customer'}`);
      if (sale.customer?.phone) doc.text(`Phone: ${sale.customer.phone}`);
      if (sale.customer?.gstin) doc.text(`GSTIN: ${sale.customer.gstin}`);
      doc.text(`Cashier: ${sale.createdBy.firstName} ${sale.createdBy.lastName}`);
      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .text('Item                       Qty  Price    Tax     Total', { underline: true });
      doc.moveDown(0.3);

      for (const item of sale.items) {
        const name = `${item.productVariant.product.name}${item.productVariant.size ? ` (${item.productVariant.size})` : ''}`;
        const line = `${name.padEnd(24)} ${String(item.quantity).padStart(3)} ${formatCurrency(item.unitPrice).padStart(7)}${sale.isGst ? ` ${formatCurrency(item.gstAmount).padStart(7)}` : ''} ${formatCurrency(item.totalPrice).padStart(8)}`;
        doc.text(line);
      }

      doc.moveDown(0.3);
      doc.text(`Subtotal:`.padEnd(50) + formatCurrency(sale.subtotal).padStart(10));
      if (Number(sale.discountAmount) > 0) {
        doc.text(`Discount:`.padEnd(50) + `-${formatCurrency(sale.discountAmount)}`.padStart(10));
      }
      if (sale.isGst) {
        doc.text(`GST Total:`.padEnd(50) + formatCurrency(sale.taxAmount).padStart(10));
      }
      doc
        .fontSize(12)
        .text(`Grand Total:`.padEnd(50) + formatCurrency(sale.grandTotal).padStart(10));
      doc.fontSize(10).moveDown(0.5);

      doc.text('Payment Details:', { underline: true });
      for (const p of sale.payments) {
        doc.text(
          `  ${p.mode}${p.reference ? ` (${p.reference})` : ''}: ${formatCurrency(p.amount)}`,
        );
      }

      doc.moveDown(1);
      doc.fontSize(12).text('Thank you for your purchase!', { align: 'center' });
      doc.text(`GST: ${sale.isGst ? 'Tax Invoice' : 'Non-GST Invoice'}`, { align: 'center' });

      doc.end();
    });
  },
};
