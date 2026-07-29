import { useNavigate } from 'react-router-dom';
import { Store, PackageSearch, ShoppingCart, Barcode, BarChart3, TrendingUp, Shield, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const features = [
  { icon: PackageSearch, label: 'Smart Inventory', desc: 'Low-stock alerts, auto reorder suggestions, real-time tracking across all your products.' },
  { icon: ShoppingCart, label: 'Lightning Billing', desc: 'Scan barcodes, apply discounts, split payments — complete a sale in under 10 seconds.' },
  { icon: Barcode, label: 'Barcode Engine', desc: 'Generate, print, and scan barcodes for your entire catalog. No extra hardware needed.' },
  { icon: BarChart3, label: 'Visual Analytics', desc: 'Sales trends, top products, profit margins — everything you need to make smarter decisions.' },
  { icon: TrendingUp, label: 'Multi-Store', desc: 'Manage inventory, pricing, and staff across multiple locations from one dashboard.' },
  { icon: Shield, label: 'Role-Based Access', desc: 'Granular permissions for Admin, Manager, Cashier, and Inventory roles.' },
];

const brands = ['Kapda Classics', 'Zara Collection', 'FabIndia Heritage', 'RS Brothers', 'Lakshmi Silks', 'Cotton Kings', 'Silk Route', 'Modern Weaves'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth } = useAuth();
  const dashboardPath = auth.user?.roles?.includes('SUPER_ADMIN') ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.08),transparent_50%)]" />

      {/* Minimal nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Central One</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate(dashboardPath)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10"
              >
                Dashboard <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-white/5 hover:border-white/20 transition-all"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero — single CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-[fadeIn_0.6s_ease-out]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Built for Indian fashion retail
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Your store,
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                supercharged.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-gray-400 max-w-md leading-relaxed">
              From inventory to billing, Central One is the all-in-one retail system
              built for Indian fashion and clothing businesses.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all shadow-xl shadow-indigo-500/25"
                >
                  Create free account <ArrowRight size={17} />
                </button>
              </div>
            )}
            {isAuthenticated && (
              <button
                onClick={() => navigate(dashboardPath)}
                className="flex items-center gap-2 px-6 py-3 mt-8 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all shadow-xl shadow-indigo-500/25"
              >
                Open Dashboard <ArrowRight size={17} />
              </button>
            )}
            <div className="flex items-center gap-5 mt-8 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> No card needed</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Free updates</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-emerald-400" /> Cancel anytime</span>
            </div>
          </div>

          {/* Terminal mockup */}
          <div className="hidden lg:flex relative items-center justify-center animate-[fadeIn_0.8s_ease-out]">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-2xl" />
              <div className="relative bg-gray-800/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">central-one@store:~$</span>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: PackageSearch, color: 'from-blue-400/20 to-blue-600/20', iconColor: 'text-blue-300', label: 'Cotton Salwar Suit', sub: 'SKU-001 · 156 in stock', right: '+24', rightClass: 'text-green-400' },
                    { icon: ShoppingCart, color: 'from-purple-400/20 to-purple-600/20', iconColor: 'text-purple-300', label: 'Invoice #0421', sub: '2 items · Cash', right: '₹1,299', rightClass: 'text-white' },
                    { icon: BarChart3, color: 'from-emerald-400/20 to-emerald-600/20', iconColor: 'text-emerald-300', label: "Today's Revenue", sub: undefined, right: '+18%', rightClass: 'text-emerald-400', bar: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                        <item.icon size={16} className={item.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{item.label}</span>
                          <span className={`text-xs font-medium ${item.rightClass}`}>{item.right}</span>
                        </div>
                        {item.sub && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.sub}</p>}
                        {item.bar && (
                          <div className="h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-mono">central-one@store:~$</span>
                  <span className="flex items-center gap-1.5 text-green-400/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
                    connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand marquee */}
      <div className="relative z-10 border-t border-white/5 py-5 overflow-hidden">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...brands, ...brands].map((name, i) => (
            <span key={i} className="text-sm text-gray-600 font-medium">{name}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10K+', label: 'Products tracked' },
              { value: '500+', label: 'Active stores' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
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
            <p className="mt-3 text-gray-500 max-w-lg mx-auto text-sm">
              From inventory management to billing, Central One has every tool
              to streamline your retail operations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.label}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                  <f.icon size={18} className="text-indigo-300" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{f.label}</h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} ShadowLabz. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/pricing')} className="hover:text-gray-400 transition-colors">Pricing</button>
            <span>v2.0</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400/60" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
