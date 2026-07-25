import { useNavigate } from 'react-router-dom';
import { Store, PackageSearch, ShoppingCart, Barcode, BarChart3, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: PackageSearch, label: 'Smart Inventory', desc: 'Real-time stock tracking with low-stock alerts and automatic reorder suggestions.' },
  { icon: ShoppingCart, label: 'Fast Billing', desc: 'Lightning-fast POS interface with barcode scanning and multiple payment modes.' },
  { icon: Barcode, label: 'Barcode Management', desc: 'Generate and print barcodes for your entire catalog in seconds.' },
  { icon: BarChart3, label: 'Analytics & Reports', desc: 'Deep insights into sales, inventory, and customer behavior with visual dashboards.' },
  { icon: TrendingUp, label: 'Multi-Store Support', desc: 'Manage multiple stores from a single dashboard with centralized control.' },
  { icon: Shield, label: 'Role-Based Access', desc: 'Granular permissions for Admin, Manager, Cashier, and Inventory roles.' },
];

const stats = [
  { value: '10K+', label: 'Products Tracked' },
  { value: '500+', label: 'Active Stores' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.1),transparent_50%)]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Store className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <p className="text-xl font-bold text-white tracking-tight">Kapda POS</p>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Retail Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/catalogue')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
            >
              Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
              >
                Get Started <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-[fadeIn_0.6s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium mb-8">
              <Zap size={14} className="text-indigo-400" />
              The modern POS for Indian retail
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Your Store,
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Supercharged.
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-400 max-w-lg leading-relaxed">
              From inventory to billing, Kapda POS is the all-in-one retail management
              system built for Indian fashion and clothing businesses.
            </p>
            <div className="flex items-center gap-4 mt-10">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/catalogue')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all shadow-xl shadow-indigo-500/25"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all shadow-xl shadow-indigo-500/25"
                  >
                    Start Free Trial <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex relative items-center justify-center animate-[fadeIn_0.8s_ease-out]">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl animate-pulse" />
              <div className="relative bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
                    <Store size={18} className="text-indigo-300" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-32 rounded-full bg-white/10" />
                    <div className="h-2 w-20 rounded-full bg-white/5 mt-1.5" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-400/60" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
                    <div className="h-2 w-2 rounded-full bg-green-400/60" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/20 flex items-center justify-center">
                      <PackageSearch size={18} className="text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Cotton Salwar Suit</span>
                        <span className="text-xs text-green-400 font-medium">+24</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">SKU-001 • 156 in stock</span>
                        <span className="text-xs text-green-400/80">Low stock</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400/20 to-purple-600/20 flex items-center justify-center">
                      <ShoppingCart size={18} className="text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Invoice #0421</span>
                        <span className="text-sm font-medium text-white">₹1,299</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">2 items • Cash</span>
                        <span className="text-xs text-gray-500">12:30 PM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center">
                      <BarChart3 size={18} className="text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">Today's Sales</span>
                        <span className="text-sm font-medium text-emerald-400">+18%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 mt-2 overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                  <span>Kapda POS v2.0</span>
                  <span className="text-green-400/60">● Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={s.label} className="text-center animate-[fadeIn_0.6s_ease-out]" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">run your store</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              From inventory management to billing, Kapda POS has every tool
              to streamline your retail operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.label}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 animate-[fadeIn_0.6s_ease-out]"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                  <f.icon size={22} className="text-indigo-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{f.label}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="max-w-lg mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">your retail?</span>
            </h2>
            <p className="mt-4 text-gray-400">
              Join hundreds of stores already using Kapda POS.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all shadow-xl shadow-indigo-500/25"
            >
              Get Started Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} ShadowLabz. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Kapda POS v2.0</span>
            <span className="text-green-400/60">● All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
