import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Check, X, CircleAlert } from 'lucide-react';
import { apiRequest } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin (Full Access)' },
  { value: 'MANAGER', label: 'Manager (Operations)' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager (Stock Only)' },
  { value: 'CASHIER', label: 'Cashier (Billing Only)' },
];

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'CASHIER',
    isActive: true,
  });

  const showToast = (message: string, type: 'error' | 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiRequest<{ data: UserData[] }>('/users'),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => apiRequest('/users', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      resetForm();
      showToast('User created successfully', 'success');
    },
    onError: (err: any) => showToast(err.message, 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest(`/users/${editingUser!.id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
      showToast('User updated successfully', 'success');
    },
    onError: (err: any) => showToast(err.message, 'error'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User status updated', 'success');
    },
    onError: (err: any) => showToast(err.message, 'error'),
  });

  const resetForm = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'CASHIER',
      isActive: true,
    });
    setEditingUser(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.roles[0] || 'CASHIER',
      isActive: user.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.email) {
      showToast('First name and email are required', 'error');
      return;
    }
    if (!editingUser && !form.password) {
      showToast('Password is required for new users', 'error');
      return;
    }

    const body: any = {
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      email: form.email,
      phone: form.phone || undefined,
      role: form.role,
      isActive: form.isActive,
    };
    if (form.password) body.password = form.password;

    if (editingUser) {
      updateMutation.mutate(body);
    } else {
      createMutation.mutate(body);
    }
  };

  const users = data?.data || [];

  const columns = [
    { key: 'name', header: 'Name', render: (u: UserData) => `${u.firstName} ${u.lastName || ''}` },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (u: UserData) => u.phone || '-' },
    {
      key: 'roles',
      header: 'Role',
      render: (u: UserData) => (
        <Badge
          variant={
            u.roles[0] === 'ADMIN' ? 'danger' : u.roles[0] === 'MANAGER' ? 'info' : 'default'
          }
        >
          {u.roles[0] || '-'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (u: UserData) => (
        <span
          className={`flex items-center gap-1 text-sm ${u.isActive ? 'text-green-600' : 'text-red-600'}`}
        >
          {u.isActive ? <Check size={14} /> : <X size={14} />}
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (u: UserData) => (
        <div className="flex gap-1">
          {hasPermission('user:edit') && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(u);
              }}
            >
              Edit
            </Button>
          )}
          {hasPermission('user:edit') && u.roles[0] !== 'ADMIN' && (
            <Button
              size="sm"
              variant={u.isActive ? 'danger' : 'outline'}
              onClick={(e) => {
                e.stopPropagation();
                toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive });
              }}
            >
              {u.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
        >
          {notification.type === 'error' ? <CircleAlert size={16} /> : <Check size={16} />}
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} /> User Management
          </h1>
          <p className="text-gray-500">Create, edit, and manage system users</p>
        </div>
        {hasPermission('user:create') && (
          <Button onClick={handleOpenCreate}>
            <UserPlus size={16} className="mr-1.5" /> Add User
          </Button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <div className="bg-white rounded-xl border">
          <Table
            columns={columns}
            data={users}
            keyExtractor={(u) => u.id}
            onRowClick={hasPermission('user:edit') ? (u) => handleOpenEdit(u) : undefined}
            emptyMessage="No users found"
          />
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          resetForm();
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
            />
          </div>
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <Input
            label={editingUser ? 'Password (leave blank to keep current)' : 'Password *'}
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            options={ROLE_OPTIONS}
          />
          {editingUser && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              Active
            </label>
          )}

          {(createMutation.isError || updateMutation.isError) && (
            <p className="text-sm text-red-500">
              {(createMutation.error || updateMutation.error)?.message || 'Operation failed'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingUser
                  ? 'Update User'
                  : 'Create User'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
