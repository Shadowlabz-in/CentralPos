import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Full system access' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Manage inventory, products, customers, view reports',
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'CASHIER' },
    update: {},
    create: {
      name: 'CASHIER',
      description: 'Generate bills, search products, view customers',
    },
  });

  const invManagerRole = await prisma.role.upsert({
    where: { name: 'INVENTORY_MANAGER' },
    update: {},
    create: {
      name: 'INVENTORY_MANAGER',
      description: 'Manage stock, purchases, barcodes, inventory reports',
    },
  });

  console.log(
    'Roles created:',
    adminRole.name,
    managerRole.name,
    cashierRole.name,
    invManagerRole.name,
  );

  // Create a default store
  const defaultStore = await prisma.store.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Store',
      code: 'MAIN',
      address: '123 Main Street',
      city: 'New Delhi',
      state: 'Delhi',
      phone: '+91-9999999999',
      email: 'store@kapda.com',
      gstin: '07ABCDE1234F1Z5',
    },
  });

  console.log('Store created:', defaultStore.name);

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kapda.com' },
    update: {},
    create: {
      email: 'admin@kapda.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+91-9999999998',
      isActive: true,
      storeId: defaultStore.id,
    },
  });

  // Assign ADMIN role
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log('Admin user created: admin@kapda.com / admin123');

  // Create a manager user
  const managerPasswordHash = await bcrypt.hash('manager123', 12);

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@kapda.com' },
    update: {},
    create: {
      email: 'manager@kapda.com',
      passwordHash: managerPasswordHash,
      firstName: 'Manager',
      lastName: 'User',
      phone: '+91-9999999997',
      isActive: true,
      storeId: defaultStore.id,
      createdById: adminUser.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: managerUser.id, roleId: managerRole.id } },
    update: {},
    create: { userId: managerUser.id, roleId: managerRole.id },
  });

  console.log('Manager user created: manager@kapda.com / manager123');

  // Create a cashier user
  const cashierPasswordHash = await bcrypt.hash('cashier123', 12);

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@kapda.com' },
    update: {},
    create: {
      email: 'cashier@kapda.com',
      passwordHash: cashierPasswordHash,
      firstName: 'Cashier',
      lastName: 'User',
      phone: '+91-9999999996',
      isActive: true,
      storeId: defaultStore.id,
      createdById: adminUser.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: cashierUser.id, roleId: cashierRole.id } },
    update: {},
    create: { userId: cashierUser.id, roleId: cashierRole.id },
  });

  console.log('Cashier user created: cashier@kapda.com / cashier123');

  // Create an inventory manager user
  const invManagerPasswordHash = await bcrypt.hash('inventory123', 12);

  const invManagerUser = await prisma.user.upsert({
    where: { email: 'inventory@kapda.com' },
    update: {},
    create: {
      email: 'inventory@kapda.com',
      passwordHash: invManagerPasswordHash,
      firstName: 'Inventory',
      lastName: 'Manager',
      phone: '+91-9999999995',
      isActive: true,
      storeId: defaultStore.id,
      createdById: adminUser.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: invManagerUser.id, roleId: invManagerRole.id } },
    update: {},
    create: { userId: invManagerUser.id, roleId: invManagerRole.id },
  });

  console.log('Inventory Manager user created: inventory@kapda.com / inventory123');
  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
