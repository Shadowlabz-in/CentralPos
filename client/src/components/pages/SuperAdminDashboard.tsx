import { Users, Store, CreditCard, BarChart3, Shield, Database, Globe, Bell } from 'lucide-react';

const cards = [
  {
    title: 'Merchants',
    description: 'Manage all registered merchants, their stores, and account status across the platform.',
    icon: Store,
    color: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Customers',
    description: 'View and manage customer accounts, purchase history, and support tickets.',
    icon: Users,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    title: 'Subscriptions',
    description: 'Oversee subscription plans, billing cycles, payment failures, and upgrade requests.',
    icon: CreditCard,
    color: 'from-purple-400 to-purple-600',
  },
  {
    title: 'Analytics',
    description: 'Platform-wide sales reports, growth metrics, and real-time business intelligence.',
    icon: BarChart3,
    color: 'from-orange-400 to-orange-600',
  },
  {
    title: 'Permissions & Roles',
    description: 'Define role hierarchies, assign granular permissions, and audit access logs.',
    icon: Shield,
    color: 'from-rose-400 to-rose-600',
  },
  {
    title: 'System Health',
    description: 'Monitor API uptime, database performance, background jobs, and error rates.',
    icon: Database,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    title: 'Email & Notifications',
    description: 'Configure email templates, push notification settings, and communication channels.',
    icon: Bell,
    color: 'from-amber-400 to-amber-600',
  },
  {
    title: 'Localization',
    description: 'Manage store locales, currency conversions, tax rules, and regional compliance.',
    icon: Globe,
    color: 'from-indigo-400 to-indigo-600',
  },
];

export default function SuperAdminDashboard() {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">High-level overview of everything across the platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.title}
            className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 text-left"
          >
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-105 transition-transform`}>
              <c.icon size={20} className="text-white" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-white">{c.title}</h2>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{c.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
