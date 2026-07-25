import { ReactNode } from 'react';
import { Store, PackageSearch, ShoppingCart, Barcode, BarChart3 } from 'lucide-react';

const features = [
  { icon: PackageSearch, label: 'Smart Inventory' },
  { icon: ShoppingCart, label: 'Fast Billing' },
  { icon: Barcode, label: 'Barcode Management' },
  { icon: BarChart3, label: 'Analytics' },
];

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.08),transparent_50%)]" />

        <div>
          <div className="flex items-center gap-3 relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">Kapda POS</p>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide">Retail Management System</p>
            </div>
          </div>
        </div>

        <div className="relative space-y-2">
          <p className="text-sm font-medium text-gray-400 tracking-wider uppercase">Features</p>
          <div className="space-y-3">
            {features.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 backdrop-blur-sm">
                  <f.icon size={16} className="text-indigo-300" />
                </div>
                <span className="text-sm text-gray-300">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-500">&copy; {new Date().getFullYear()} ShadowLabz. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50/80 px-4 py-12 min-h-screen">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">Kapda POS</p>
              <p className="text-[11px] text-gray-500 font-medium">Retail Management System</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
