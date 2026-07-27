import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import {
  Plus, Pencil, Trash2, ShieldCheck, ChevronDown, User, Eye, EyeOff,
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  label: string;
  description: string | null;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface RolesResponse {
  status: string;
  data: Role[];
}

interface RoleResponse {
  status: string;
  data: Role;
}

interface StatusResponse {
  status: string;
}

const initialForm = {
  name: '',
  label: '',
  description: '',
  permissions: [] as string[],
};

const permissionLabels: Record<string, string> = {
  'dashboard:view': 'Dashboard Access',
  'product:view': 'View Products',
  'product:create': 'Create Products',
  'product:edit': 'Edit Products',
  'product:delete': 'Delete Products',
  'category:view': 'View Categories',
  'category:create': 'Create Categories',
  'category:edit': 'Edit Categories',
  'category:delete': 'Delete Categories',
  'brand:view': 'View Brands',
  'brand:create': 'Create Brands',
  'brand:edit': 'Edit Brands',
  'brand:delete': 'Delete Brands',
  'supplier:view': 'View Suppliers',
  'supplier:create': 'Create Suppliers',
  'supplier:edit': 'Edit Suppliers',
  'supplier:delete': 'Delete Suppliers',
  'inventory:view': 'View Inventory',
  'inventory:adjust': 'Adjust Inventory',
  'inventory:barcode:generate': 'Generate Barcodes',
  'inventory:stock:add': 'Add Stock',
  'inventory:history:view': 'View History',
  'inventory:item:manage': 'Manage Items',
  'purchase:view': 'View Purchases',
  'purchase:create': 'Create Purchases',
  'purchase:edit': 'Edit Purchases',
  'purchase:delete': 'Delete Purchases',
  'pos:access': 'POS Access',
  'pos:return': 'POS Returns',
  'pos:customer:manage': 'POS Customer Management',
  'pos:view:purchase-price': 'View Purchase Price',
  'customer:view': 'View Customers',
  'customer:create': 'Create Customers',
  'customer:edit': 'Edit Customers',
  'report:view': 'View Reports',
  'report:sales': 'Sales Reports',
  'report:gst': 'GST Reports',
  'report:inventory': 'Inventory Reports',
  'user:view': 'View Users',
  'user:create': 'Create Users',
  'user:edit': 'Edit Users',
  'user:delete': 'Delete Users',
  'user:manage-roles': 'Manage User Roles',
  'settings:view': 'View Settings',
  'settings:edit': 'Edit Settings',
  'system:configure': 'Configure System',
  'system:backup': 'Backup System',
  'system:restore': 'Restore System',
  'system:audit:log': 'Audit Log',
  'store:view': 'View Stores',
  'store:create': 'Create Stores',
  'store:edit': 'Edit Stores',
  'store:delete': 'Delete Stores',
  'plan:view': 'View Pricing Plans',
  'plan:create': 'Create Pricing Plans',
  'plan:edit': 'Edit Pricing Plans',
  'plan:delete': 'Delete Pricing Plans',
  'admin:access': 'Admin Panel Access',
};

const groupLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  product: 'Products',
  category: 'Categories',
  brand: 'Brands',
  supplier: 'Suppliers',
  inventory: 'Inventory',
  purchase: 'Purchases',
  pos: 'POS / Billing',
  customer: 'Customers',
  report: 'Reports',
  user: 'User Management',
  settings: 'Settings',
  system: 'System',
  store: 'Stores',
  plan: 'Pricing Plans',
  admin: 'Admin',
};

const groupOrder = [
  'dashboard', 'product', 'category', 'brand', 'supplier',
  'inventory', 'purchase', 'pos', 'customer', 'report',
  'user', 'settings', 'system', 'store', 'plan', 'admin',
];

export default function SuperAdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const allPermissions = Object.keys(permissionLabels);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<RolesResponse>('/roles');
      setRoles(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = async () => {
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<RoleResponse>('/roles', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setCreateOpen(false);
      setForm(initialForm);
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<RoleResponse>(`/roles/${selectedRole.id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setEditOpen(false);
      setSelectedRole(null);
      setForm(initialForm);
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setError('');
    try {
      await apiRequest<StatusResponse>(`/roles/${selectedRole.id}`, {
        method: 'DELETE',
      });
      setDeleteOpen(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreate = () => {
    setForm(initialForm);
    setCreateOpen(true);
  };

  const openEdit = (role: Role) => {
    setSelectedRole(role);
    setForm({
      name: role.name,
      label: role.label,
      description: role.description || '',
      permissions: [...role.permissions],
    });
    setEditOpen(true);
  };

  const openDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  const groupedPermissions: Record<string, string[]> = {};
  for (const perm of allPermissions) {
    const group = perm.split(':')[0];
    if (!groupedPermissions[group]) groupedPermissions[group] = [];
    groupedPermissions[group].push(perm);
  }

  const togglePermission = (perm: string) => {
    const checked = form.permissions.includes(perm);
    setForm({
      ...form,
      permissions: checked
        ? form.permissions.filter((p) => p !== perm)
        : [...form.permissions, perm],
    });
  };

  const toggleGroup = (group: string, perms: string[]) => {
    const allChecked = perms.every((p) => form.permissions.includes(p));
    setForm({
      ...form,
      permissions: allChecked
        ? form.permissions.filter((p) => !perms.includes(p))
        : [...new Set([...form.permissions, ...perms])],
    });
  };

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage roles and their permissions.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1.5" />
          Create Role
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No roles found.</div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Users</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-accent transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <ShieldCheck size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{role.name}</p>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{role.label}</td>
                  <td className="px-5 py-4">
                    <Badge variant="default">{role.permissions.length} permissions</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{role.userCount}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(role)}
                        className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {role.name !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => openDelete(role)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create Role" size="xl">
        <RoleForm form={form} onChange={setForm} isCreate />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Role" size="xl">
        <RoleForm form={form} onChange={setForm} isCreate={false} />
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
          <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${selectedRole?.label || selectedRole?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}

function RoleForm({
  form,
  onChange,
  isCreate,
}: {
  form: typeof initialForm;
  onChange: (f: typeof initialForm) => void;
  isCreate: boolean;
}) {
  const allPermissions = Object.keys(permissionLabels);

  const groupedPermissions: Record<string, string[]> = {};
  for (const perm of allPermissions) {
    const group = perm.split(':')[0];
    if (!groupedPermissions[group]) groupedPermissions[group] = [];
    groupedPermissions[group].push(perm);
  }

  const togglePermission = (perm: string) => {
    const checked = form.permissions.includes(perm);
    onChange({
      ...form,
      permissions: checked
        ? form.permissions.filter((p) => p !== perm)
        : [...form.permissions, perm],
    });
  };

  const toggleGroup = (group: string, perms: string[]) => {
    const allChecked = perms.every((p) => form.permissions.includes(p));
    onChange({
      ...form,
      permissions: allChecked
        ? form.permissions.filter((p) => !perms.includes(p))
        : [...new Set([...form.permissions, ...perms])],
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-muted-foreground" />
            Name <span className="text-destructive">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value.toUpperCase().replace(/[^A-Z_]/g, '') })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="ROLE_NAME"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <User size={14} className="text-muted-foreground" />
            Label <span className="text-destructive">*</span>
          </label>
          <input
            value={form.label}
            onChange={(e) => onChange({ ...form, label: e.target.value })}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Role Label"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          placeholder="Optional description"
          rows={2}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck size={16} className="text-primary" />
            Permissions
            <span className="text-xs font-normal text-muted-foreground">
              ({form.permissions.length}/{allPermissions.length} enabled)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const allChecked = form.permissions.length === allPermissions.length;
              onChange({ ...form, permissions: allChecked ? [] : [...allPermissions] });
            }}
            className="text-[10px] font-semibold uppercase tracking-wider transition-colors text-primary hover:text-primary/80"
          >
            {form.permissions.length === allPermissions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="rounded-xl border bg-card p-5 max-h-80 overflow-y-auto space-y-4">
          {groupOrder.map((group) => {
            const groupPerms = groupedPermissions[group];
            if (!groupPerms || groupPerms.length === 0) return null;
            const checkedCount = groupPerms.filter((p) => form.permissions.includes(p)).length;
            const allChecked = checkedCount === groupPerms.length;
            return (
              <div key={group}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-3 rounded-full bg-primary/60" />
                    {groupLabels[group] || group}
                    <span className="text-[10px] font-normal text-muted-foreground/60">
                      ({checkedCount}/{groupPerms.length})
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group, groupPerms)}
                    className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${allChecked ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                  >
                    {allChecked ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groupPerms.map((perm) => {
                    const checked = form.permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-all ${checked ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-transparent text-muted-foreground hover:border-muted-foreground/30'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm)}
                          className="sr-only"
                        />
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {permissionLabels[perm] || perm}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
