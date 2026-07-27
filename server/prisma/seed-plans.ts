import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: 'Business Essentials',
    code: 'essentials',
    description: 'One-time purchase including software license, hardware, on-site installation, and 6 months support.',
    price: 15000,
    currency: 'INR',
    billingPeriod: 'one-time',
    maxStores: 1,
    maxUsers: 2,
    maxProducts: -1,
    sortOrder: 0,
    isPopular: true,
    features: [
      { key: 'software_license', label: 'Software License (1 PC)', included: true },
      { key: 'user_limit', label: 'Up to 2 Users', included: true },
      { key: 'pos_billing', label: 'POS Billing', included: true },
      { key: 'product_management', label: 'Product Management (Unlimited)', included: true },
      { key: 'category_brand', label: 'Categories & Brands', included: true },
      { key: 'customer_management', label: 'Customer Management', included: true },
      { key: 'gst_compliance', label: 'GST Compliance', included: true },
      { key: 'invoice_printing', label: 'Invoice & Receipt Printing', included: true },
      { key: 'inventory_management', label: 'Inventory Management', included: true },
      { key: 'barcode_scanner', label: 'Barcode Scanner (Hardware)', included: true },
      { key: 'thermal_printer', label: 'Thermal Printer (Hardware)', included: true },
      { key: 'on_site_installation', label: 'On-site Installation', included: true },
      { key: 'staff_training', label: 'Staff Training (Up to 2 Users)', included: true },
      { key: 'support_6_months', label: '6 Months Support & Updates', included: true },
      { key: 'basic_reports', label: 'Basic Reports', included: true },
      { key: 'supplier_management', label: 'Supplier Management', included: false },
      { key: 'purchase_management', label: 'Purchase Management', included: false },
      { key: 'backup_restore', label: 'Backup & Restore', included: true },
      { key: 'multi_store', label: 'Multi-Store Support', included: false },
      { key: 'barcode_label_printer', label: 'Barcode Label Printer', included: false },
      { key: 'additional_users', label: 'Additional User Licenses', included: false },
    ],
  },
  {
    name: 'Central Care Plan',
    code: 'care',
    description: 'Annual support and updates plan. Required for continued support after the initial 6 months.',
    price: 0,
    yearlyPrice: 5999,
    currency: 'INR',
    billingPeriod: 'yearly',
    maxStores: 1,
    maxUsers: 2,
    maxProducts: -1,
    sortOrder: 1,
    isPopular: false,
    features: [
      { key: 'priority_support', label: 'Priority Support', included: true },
      { key: 'software_updates', label: 'Software Updates', included: true },
      { key: 'gst_compliance_updates', label: 'GST Compliance Updates', included: true },
      { key: 'bug_fixes', label: 'Bug Fixes & Patches', included: true },
      { key: 'phone_support', label: 'Phone Support', included: true },
      { key: 'remote_assistance', label: 'Remote Assistance', included: true },
      { key: 'pos_billing', label: 'POS Billing', included: true },
      { key: 'product_management', label: 'Product Management', included: true },
      { key: 'category_brand', label: 'Categories & Brands', included: true },
      { key: 'customer_management', label: 'Customer Management', included: true },
      { key: 'gst_compliance', label: 'GST Compliance', included: true },
      { key: 'invoice_printing', label: 'Invoice & Receipt Printing', included: true },
      { key: 'inventory_management', label: 'Inventory Management', included: true },
      { key: 'basic_reports', label: 'Basic Reports', included: true },
      { key: 'backup_restore', label: 'Backup & Restore', included: true },
    ],
  },
];

async function main() {
  console.log('Seeding pricing plans...');
  for (const plan of plans) {
    await prisma.pricingPlan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ ${plan.name} (${plan.code})`);
  }
  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
