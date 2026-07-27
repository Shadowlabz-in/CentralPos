import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { MessageSquare, Phone, Mail, MapPin, Building2, User, Calendar, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface DemoRequest {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  businessType: string;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'danger' }> = {
  new: { label: 'New', variant: 'info' },
  contacted: { label: 'Contacted', variant: 'warning' },
  converted: { label: 'Converted', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
};

export default function DemoRequestsAdmin() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, closed: 0 });
  const [selected, setSelected] = useState<DemoRequest | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchRequests = useCallback(async (page: number) => {
    setLoading(true);
    setError('');
    try {
      const [listRes, statsRes] = await Promise.all([
        apiRequest<{ status: string; data: DemoRequest[]; meta: any }>(`/demo-requests?page=${page}&limit=20`),
        apiRequest<{ status: string; data: any }>('/demo-requests/stats'),
      ]);
      setRequests(listRes.data);
      setMeta(listRes.meta);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(1);
  }, [fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    setStatusUpdating(true);
    try {
      await apiRequest(`/demo-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setSelected(null);
      fetchRequests(meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const statusOptions = ['new', 'contacted', 'converted', 'closed'];

  return (
    <div className="animate-[fadeIn_0.4s_ease-out] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Demo Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage incoming demo enquiries.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'New', value: stats.new, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Contacted', value: stats.contacted, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Converted', value: stats.converted, color: 'text-green-600 dark:text-green-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card">
          <MessageSquare size={32} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No demo requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border bg-card p-5 hover:bg-accent/50 transition-all cursor-pointer"
              onClick={() => setSelected(selected?.id === req.id ? null : req)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{req.businessName}</h3>
                    <p className="text-xs text-muted-foreground">{req.ownerName} · {req.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[req.status]?.variant || 'default'}>
                    {statusConfig[req.status]?.label || req.status}
                  </Badge>
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone size={12} /> {req.phone}</span>
                <span className="flex items-center gap-1"><Mail size={12} /> {req.email}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {req.city}</span>
                <span className="flex items-center gap-1"><Building2 size={12} /> {req.businessType}</span>
              </div>

              {selected?.id === req.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {req.message && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                      <p className="text-sm text-foreground bg-muted rounded-lg p-3">{req.message}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); updateStatus(req.id, s); }}
                          disabled={statusUpdating || req.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            req.status === s
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-muted text-muted-foreground hover:bg-accent border border-transparent'
                          } disabled:opacity-50`}
                        >
                          {statusConfig[s]?.label || s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onPageChange={fetchRequests} />
        </div>
      )}
    </div>
  );
}
