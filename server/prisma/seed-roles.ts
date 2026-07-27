import { PrismaClient } from '@prisma/client';
import { RolePermissions } from '../src/config/permissions';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'SUPER_ADMIN', label: 'Super Admin' },
    { name: 'ADMIN', label: 'Owner' },
    { name: 'MANAGER', label: 'Manager' },
    { name: 'CASHIER', label: 'Cashier' },
    { name: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
    { name: 'BILLING', label: 'Billing' },
  ];
  for (const { name, label } of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {
        label,
        description: `${label} role`,
        permissions: RolePermissions[name] || [],
      },
      create: {
        name,
        label,
        description: `${label} role`,
        permissions: RolePermissions[name] || [],
      },
    });
  }
  console.log('Roles seeded with permissions');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
