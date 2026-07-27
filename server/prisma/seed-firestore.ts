import { firestore } from '../src/lib/firebase-admin';

function doc(name: string) {
  return firestore.collection(name).doc();
}

interface ModuleDef {
  key: string;
  displayName: string;
  description: string;
  icon: string;
  sortOrder: number;
  permissions: { key: string; displayName: string; description: string }[];
}

interface RoleDef {
  name: string;
  displayName: string;
  description: string;
  priority: number;
  isSystem: boolean;
  modules: Record<string, Record<string, boolean>>;
}

const MODULES: ModuleDef[] = [
  {
    key: 'dashboard',
    displayName: 'Dashboard',
    description: 'Overview and analytics home screen',
    icon: 'layout-dashboard',
    sortOrder: 1,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View dashboard' },
    ],
  },
  {
    key: 'catalogue',
    displayName: 'Catalogue',
    description: 'Products, variants, categories, brands, fabrics, sizes, colors',
    icon: 'book-open',
    sortOrder: 2,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View catalogue items' },
      { key: 'create', displayName: 'Create', description: 'Create new catalogue items' },
      { key: 'edit', displayName: 'Edit', description: 'Edit existing catalogue items' },
      { key: 'delete', displayName: 'Delete', description: 'Delete catalogue items' },
      { key: 'export', displayName: 'Export', description: 'Export catalogue data' },
    ],
  },
  {
    key: 'inventory',
    displayName: 'Inventory',
    description: 'Stock levels, adjustments, barcodes, stock history',
    icon: 'package',
    sortOrder: 3,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View inventory' },
      { key: 'adjust', displayName: 'Adjust', description: 'Adjust stock levels' },
      { key: 'barcode-generate', displayName: 'Generate Barcodes', description: 'Generate barcode labels' },
      { key: 'stock-add', displayName: 'Add Stock', description: 'Add opening stock' },
      { key: 'history-view', displayName: 'View History', description: 'View stock movement history' },
      { key: 'item-manage', displayName: 'Manage Items', description: 'Manage individual inventory items' },
    ],
  },
  {
    key: 'purchases',
    displayName: 'Purchases',
    description: 'Purchase orders, supplier bills, purchase returns',
    icon: 'shopping-cart',
    sortOrder: 4,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View purchases' },
      { key: 'create', displayName: 'Create', description: 'Create purchase orders' },
      { key: 'edit', displayName: 'Edit', description: 'Edit purchase orders' },
      { key: 'delete', displayName: 'Delete', description: 'Delete purchase orders' },
      { key: 'approve', displayName: 'Approve', description: 'Approve purchase orders' },
    ],
  },
  {
    key: 'pos',
    displayName: 'Point of Sale',
    description: 'Sales counter, billing, returns, customer management at counter',
    icon: 'cash-register',
    sortOrder: 5,
    permissions: [
      { key: 'access', displayName: 'Access', description: 'Access POS terminal' },
      { key: 'return', displayName: 'Process Returns', description: 'Process sales returns' },
      { key: 'customer-manage', displayName: 'Manage Customers', description: 'Create/edit customers at POS' },
      { key: 'view-purchase-price', displayName: 'View Purchase Price', description: 'See purchase cost at POS' },
      { key: 'discount', displayName: 'Apply Discounts', description: 'Apply discounts to sales' },
    ],
  },
  {
    key: 'customers',
    displayName: 'Customers',
    description: 'Customer database, loyalty, credit notes',
    icon: 'users',
    sortOrder: 6,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View customers' },
      { key: 'create', displayName: 'Create', description: 'Create customers' },
      { key: 'edit', displayName: 'Edit', description: 'Edit customer details' },
      { key: 'delete', displayName: 'Delete', description: 'Delete customers' },
      { key: 'credit-note', displayName: 'Credit Notes', description: 'Manage credit notes' },
    ],
  },
  {
    key: 'suppliers',
    displayName: 'Suppliers',
    description: 'Supplier database and management',
    icon: 'truck',
    sortOrder: 7,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View suppliers' },
      { key: 'create', displayName: 'Create', description: 'Create suppliers' },
      { key: 'edit', displayName: 'Edit', description: 'Edit supplier details' },
      { key: 'delete', displayName: 'Delete', description: 'Delete suppliers' },
    ],
  },
  {
    key: 'reports',
    displayName: 'Reports',
    description: 'Sales reports, GST reports, inventory reports, analytics',
    icon: 'bar-chart-3',
    sortOrder: 8,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View reports' },
      { key: 'sales', displayName: 'Sales Reports', description: 'View sales reports' },
      { key: 'gst', displayName: 'GST Reports', description: 'View GST reports' },
      { key: 'inventory', displayName: 'Inventory Reports', description: 'View inventory reports' },
      { key: 'export', displayName: 'Export', description: 'Export report data' },
      { key: 'schedule', displayName: 'Schedule', description: 'Schedule automated reports' },
    ],
  },
  {
    key: 'users',
    displayName: 'Users',
    description: 'Staff accounts, roles, permissions',
    icon: 'shield',
    sortOrder: 9,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View users' },
      { key: 'create', displayName: 'Create', description: 'Create users' },
      { key: 'edit', displayName: 'Edit', description: 'Edit user details' },
      { key: 'delete', displayName: 'Delete', description: 'Delete users' },
      { key: 'manage-roles', displayName: 'Manage Roles', description: 'Assign and modify roles' },
    ],
  },
  {
    key: 'stores',
    displayName: 'Stores',
    description: 'Multi-store management and configuration',
    icon: 'store',
    sortOrder: 10,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View stores' },
      { key: 'create', displayName: 'Create', description: 'Create new stores' },
      { key: 'edit', displayName: 'Edit', description: 'Edit store details' },
      { key: 'delete', displayName: 'Delete', description: 'Delete stores' },
      { key: 'configure', displayName: 'Configure', description: 'Configure store settings' },
    ],
  },
  {
    key: 'settings',
    displayName: 'Settings',
    description: 'System settings, invoice templates, printer, GST, barcode',
    icon: 'settings',
    sortOrder: 11,
    permissions: [
      { key: 'view', displayName: 'View', description: 'View settings' },
      { key: 'edit', displayName: 'Edit', description: 'Edit settings' },
      { key: 'configure', displayName: 'Configure', description: 'Advanced configuration' },
    ],
  },
  {
    key: 'system',
    displayName: 'System',
    description: 'Backups, audit logs, system health',
    icon: 'database',
    sortOrder: 12,
    permissions: [
      { key: 'backup', displayName: 'Backup', description: 'Create backups' },
      { key: 'restore', displayName: 'Restore', description: 'Restore from backups' },
      { key: 'audit-log', displayName: 'Audit Logs', description: 'View audit logs' },
      { key: 'configure', displayName: 'Configure', description: 'System configuration' },
      { key: 'health', displayName: 'Health', description: 'View system health' },
    ],
  },
  {
    key: 'admin',
    displayName: 'Admin Panel',
    description: 'Super admin panel for platform management',
    icon: 'shield',
    sortOrder: 0,
    permissions: [
      { key: 'access', displayName: 'Access', description: 'Access admin panel' },
      { key: 'manage-platform', displayName: 'Manage Platform', description: 'Platform-level management' },
    ],
  },
];

const ROLES: RoleDef[] = [
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Admin',
    description: 'Full platform access — can manage stores, users, system settings, and all data across the entire system.',
    priority: 1000,
    isSystem: true,
    modules: Object.fromEntries(MODULES.map((m) => [m.key, Object.fromEntries(m.permissions.map((p) => [p.key, true]))])),
  },
  {
    name: 'ADMIN',
    displayName: 'Admin',
    description: 'Full store-level access — can manage inventory, purchases, sales, users, and settings within their store.',
    priority: 800,
    isSystem: true,
    modules: {
      dashboard: { view: true },
      catalogue: { view: true, create: true, edit: true, delete: true, export: true },
      inventory: { view: true, adjust: true, 'barcode-generate': true, 'stock-add': true, 'history-view': true, 'item-manage': true },
      purchases: { view: true, create: true, edit: true, delete: true, approve: true },
      pos: { access: true, return: true, 'customer-manage': true, 'view-purchase-price': true, discount: true },
      customers: { view: true, create: true, edit: true, delete: true, 'credit-note': true },
      suppliers: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, sales: true, gst: true, inventory: true, export: true },
      users: { view: true, create: true, edit: true, delete: true },
      stores: { view: true },
      settings: { view: true, edit: true },
      system: { backup: true, restore: true, 'audit-log': true },
      admin: {},
    },
  },
  {
    name: 'MANAGER',
    displayName: 'Manager',
    description: 'Oversees daily operations — can manage inventory, purchases, and sales, with report access.',
    priority: 600,
    isSystem: true,
    modules: {
      dashboard: { view: true },
      catalogue: { view: true, create: true, edit: true },
      inventory: { view: true, adjust: true, 'history-view': true },
      purchases: { view: true, create: true, edit: true },
      pos: { access: true, return: true, 'customer-manage': true },
      customers: { view: true, create: true, edit: true },
      suppliers: { view: true, create: true, edit: true },
      reports: { view: true, sales: true, inventory: true },
      users: {},
      stores: {},
      settings: {},
      system: {},
      admin: {},
    },
  },
  {
    name: 'CASHIER',
    displayName: 'Cashier',
    description: 'Handles billing at the counter — can process sales, manage customers, and view products.',
    priority: 400,
    isSystem: true,
    modules: {
      dashboard: { view: true },
      catalogue: { view: true },
      inventory: {},
      purchases: {},
      pos: { access: true, return: true, 'customer-manage': true },
      customers: { view: true, create: true, edit: true },
      suppliers: {},
      reports: {},
      users: {},
      stores: {},
      settings: {},
      system: {},
      admin: {},
    },
  },
  {
    name: 'INVENTORY_MANAGER',
    displayName: 'Inventory Manager',
    description: 'Focuses on stock management — can manage catalogue, inventory, purchases, and suppliers.',
    priority: 500,
    isSystem: true,
    modules: {
      dashboard: { view: true },
      catalogue: { view: true, create: true, edit: true },
      inventory: { view: true, adjust: true, 'barcode-generate': true, 'stock-add': true, 'history-view': true, 'item-manage': true },
      purchases: { view: true, create: true, edit: true },
      pos: {},
      customers: {},
      suppliers: { view: true, create: true, edit: true },
      reports: { view: true, inventory: true },
      users: {},
      stores: {},
      settings: {},
      system: {},
      admin: {},
    },
  },
];

function modulesToPermissionStrings(modules: Record<string, Record<string, boolean>>): string[] {
  const perms: string[] = [];
  for (const [moduleKey, actions] of Object.entries(modules)) {
    for (const [action, allowed] of Object.entries(actions)) {
      if (allowed) {
        perms.push(`${moduleKey}:${action}`);
      }
    }
  }
  return perms;
}

async function seedModules() {
  console.log('Seeding modules...');
  const batch = firestore.batch();
  for (const mod of MODULES) {
    const ref = firestore.collection('modules').doc(mod.key);
    batch.set(ref, {
      key: mod.key,
      displayName: mod.displayName,
      description: mod.description,
      icon: mod.icon,
      sortOrder: mod.sortOrder,
      permissions: mod.permissions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await batch.commit();
  console.log(`  ${MODULES.length} modules seeded`);
}

async function seedRoles() {
  console.log('Seeding roles...');
  const batch = firestore.batch();
  for (const role of ROLES) {
    const ref = firestore.collection('roles').doc(role.name);
    const permissions = modulesToPermissionStrings(role.modules);
    batch.set(ref, {
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      priority: role.priority,
      isSystem: role.isSystem,
      isActive: true,
      modules: role.modules,
      permissions,
      permissionsCount: permissions.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await batch.commit();
  console.log(`  ${ROLES.length} roles seeded`);
}

async function seedSuperAdmin() {
  console.log('Seeding super admin user...');
  const email = 'superadmin@kapda.com';
  const existingSnapshot = await firestore.collection('users').where('email', '==', email).limit(1).get();
  if (!existingSnapshot.empty) {
    console.log(`  User already exists in Firestore: ${email}`);
    return;
  }

  const superRole = ROLES.find((r) => r.name === 'SUPER_ADMIN')!;
  const permissions = modulesToPermissionStrings(superRole.modules);

  await firestore.collection('users').add({
    uid: '', // will be updated after Firebase Auth user lookup
    email,
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+91-9999999999',
    isActive: true,
    isEmailVerified: true,
    roles: ['SUPER_ADMIN'],
    roleDisplayNames: ['Super Admin'],
    permissions,
    storeIds: [],
    primaryStoreId: null,
    preferences: {
      theme: 'dark',
      language: 'en',
      defaultLandingPage: '/admin',
      itemsPerPage: 20,
    },
    notificationSettings: {
      lowStockAlert: true,
      outOfStockAlert: true,
      dailySalesSummary: false,
      emailEnabled: false,
      smsEnabled: false,
    },
    metadata: {
      lastLoginAt: null,
      loginCount: 0,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log(`  Super admin user created in Firestore: ${email}`);
}

async function seedSyncLog() {
  await firestore.collection('_meta').doc('seed').set({
    seededAt: new Date(),
    version: '1.0.0',
    modulesCount: MODULES.length,
    rolesCount: ROLES.length,
  });
}

async function main() {
  console.log('\n=== Firestore Seed ===\n');
  await seedModules();
  await seedRoles();
  await seedSuperAdmin();
  await seedSyncLog();
  console.log('\nFirestore seed complete.\n');
}

main().catch((e) => {
  console.error('Firestore seed failed:', e);
  process.exit(1);
});
