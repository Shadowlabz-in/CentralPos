export const Permissions = {
  DASHBOARD_VIEW: 'dashboard:view',

  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',

  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_EDIT: 'category:edit',
  CATEGORY_DELETE: 'category:delete',

  BRAND_VIEW: 'brand:view',
  BRAND_CREATE: 'brand:create',
  BRAND_EDIT: 'brand:edit',
  BRAND_DELETE: 'brand:delete',

  SUPPLIER_VIEW: 'supplier:view',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_EDIT: 'supplier:edit',
  SUPPLIER_DELETE: 'supplier:delete',

  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_BARCODE_GENERATE: 'inventory:barcode:generate',
  INVENTORY_STOCK_ADD: 'inventory:stock:add',
  INVENTORY_HISTORY_VIEW: 'inventory:history:view',
  INVENTORY_ITEM_MANAGE: 'inventory:item:manage',

  PURCHASE_VIEW: 'purchase:view',
  PURCHASE_CREATE: 'purchase:create',
  PURCHASE_EDIT: 'purchase:edit',
  PURCHASE_DELETE: 'purchase:delete',

  POS_ACCESS: 'pos:access',
  POS_RETURN: 'pos:return',
  POS_CUSTOMER_MANAGE: 'pos:customer:manage',
  POS_VIEW_PURCHASE_PRICE: 'pos:view:purchase-price',

  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_EDIT: 'customer:edit',

  REPORT_VIEW: 'report:view',
  REPORT_SALES: 'report:sales',
  REPORT_GST: 'report:gst',
  REPORT_INVENTORY: 'report:inventory',

  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',

  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',

  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_AUDIT_LOG: 'system:audit:log',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

const ALL_PERMISSIONS = Object.values(Permissions) as Permission[];

export const RolePermissions: Record<string, Permission[]> = {
  ADMIN: ALL_PERMISSIONS,

  INVENTORY_MANAGER: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_EDIT,
    Permissions.BRAND_VIEW,
    Permissions.BRAND_CREATE,
    Permissions.BRAND_EDIT,
    Permissions.SUPPLIER_VIEW,
    Permissions.SUPPLIER_CREATE,
    Permissions.SUPPLIER_EDIT,
    Permissions.INVENTORY_VIEW,
    Permissions.INVENTORY_ADJUST,
    Permissions.INVENTORY_BARCODE_GENERATE,
    Permissions.INVENTORY_STOCK_ADD,
    Permissions.INVENTORY_HISTORY_VIEW,
    Permissions.INVENTORY_ITEM_MANAGE,
    Permissions.PURCHASE_VIEW,
    Permissions.PURCHASE_CREATE,
    Permissions.PURCHASE_EDIT,
    Permissions.REPORT_VIEW,
    Permissions.REPORT_INVENTORY,
  ],

  CASHIER: [
    Permissions.DASHBOARD_VIEW,
    Permissions.POS_ACCESS,
    Permissions.POS_RETURN,
    Permissions.POS_CUSTOMER_MANAGE,
    Permissions.CUSTOMER_VIEW,
    Permissions.CUSTOMER_CREATE,
    Permissions.CUSTOMER_EDIT,
    Permissions.PRODUCT_VIEW,
  ],

  MANAGER: [
    Permissions.DASHBOARD_VIEW,
    Permissions.PRODUCT_VIEW,
    Permissions.PRODUCT_CREATE,
    Permissions.PRODUCT_EDIT,
    Permissions.CATEGORY_VIEW,
    Permissions.CATEGORY_CREATE,
    Permissions.CATEGORY_EDIT,
    Permissions.BRAND_VIEW,
    Permissions.BRAND_CREATE,
    Permissions.BRAND_EDIT,
    Permissions.INVENTORY_VIEW,
    Permissions.INVENTORY_ADJUST,
    Permissions.INVENTORY_HISTORY_VIEW,
    Permissions.PURCHASE_VIEW,
    Permissions.PURCHASE_CREATE,
    Permissions.PURCHASE_EDIT,
    Permissions.POS_ACCESS,
    Permissions.POS_RETURN,
    Permissions.POS_CUSTOMER_MANAGE,
    Permissions.REPORT_VIEW,
    Permissions.REPORT_SALES,
    Permissions.REPORT_INVENTORY,
    Permissions.CUSTOMER_VIEW,
    Permissions.CUSTOMER_CREATE,
    Permissions.CUSTOMER_EDIT,
  ],
};

export function getPermissionsForRoles(roles: string[]): Permission[] {
  const perms = new Set<Permission>();
  for (const role of roles) {
    const rolePerms = RolePermissions[role];
    if (rolePerms) {
      for (const p of rolePerms) {
        perms.add(p);
      }
    }
  }
  return Array.from(perms);
}

export function hasPermission(userRoles: string[], requiredPermission: Permission): boolean {
  const perms = getPermissionsForRoles(userRoles);
  return perms.includes(requiredPermission);
}
