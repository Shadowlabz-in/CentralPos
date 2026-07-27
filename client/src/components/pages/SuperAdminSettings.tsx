import { Shield, Key, Bell } from 'lucide-react';

const sections = [
  {
    title: 'Role Management',
    desc: 'Configure system roles and their permissions.',
    icon: Shield,
  },
  {
    title: 'Authentication',
    desc: 'Manage authentication providers and security settings.',
    icon: Key,
  },
  {
    title: 'Notifications',
    desc: 'Configure system-wide notification preferences.',
    icon: Bell,
  },
];

export default function SuperAdminSettings() {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">System-wide configuration.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((s) => (
          <div key={s.title} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <s.icon size={20} className="text-indigo-300" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{s.title}</h3>
            <p className="mt-1.5 text-sm text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
