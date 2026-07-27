import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Check, X, ArrowRight, Store, Star } from 'lucide-react';

interface PlanFeature {
  key: string;
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  yearlyPrice: number | null;
  currency: string;
  billingPeriod: string;
  maxStores: number;
  maxUsers: number;
  maxProducts: number;
  features: PlanFeature[];
  isPopular: boolean;
  sortOrder: number;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, auth } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);

  const dashboardPath = auth.user?.roles?.includes('SUPER_ADMIN') ? '/admin' : '/catalogue';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/plans');
        const data = await res.json();
        setPlans(data.data || []);
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const formatPrice = (price: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return price === 0 ? 'Free' : `${symbol}${price.toLocaleString('en-IN')}`;
  };

  const getPrice = (plan: Plan) => {
    return yearly && plan.yearlyPrice != null ? plan.yearlyPrice : plan.price;
  };

  const getPeriod = (plan: Plan) => {
    if (plan.price === 0) return '';
    return yearly ? '/year' : '/month';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.12),transparent_60%)]" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Central One</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all"
          >
            Home
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => navigate(dashboardPath)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10"
            >
              Dashboard <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/25"
            >
              Get Started <ArrowRight size={15} />
            </button>
          )}
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
            No hidden fees. No surprises. Pay only for what you need, and upgrade anytime.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? 'bg-indigo-500' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${yearly ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-1.5 text-xs text-emerald-400 font-normal">Save up to 17%</span>
          </span>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading plans...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const price = getPrice(plan);
              const period = getPeriod(plan);
              const isUnlimited = (val: number) => val === -1;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-300 ${
                    plan.isPopular
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-semibold shadow-lg">
                        <Star size={12} /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{formatPrice(price, plan.currency)}</span>
                      {period && <span className="text-sm text-gray-500">{period}</span>}
                    </div>
                    {yearly && plan.yearlyPrice != null && plan.price > 0 && (
                      <p className="text-xs text-emerald-400 mt-1">
                        vs {formatPrice(plan.price * 12, plan.currency)}/yr monthly — save {formatPrice(plan.price * 12 - plan.yearlyPrice, plan.currency)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-8 flex-1">
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Stores</span>
                      <span className="text-white font-medium">{isUnlimited(plan.maxStores) ? 'Unlimited' : plan.maxStores}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Users</span>
                      <span className="text-white font-medium">{isUnlimited(plan.maxUsers) ? 'Unlimited' : plan.maxUsers}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Products</span>
                      <span className="text-white font-medium">{isUnlimited(plan.maxProducts) ? 'Unlimited' : plan.maxProducts}</span>
                    </div>
                    {plan.features.map((f) => (
                      <div key={f.key} className="flex items-center gap-2 text-xs py-1">
                        {f.included ? (
                          <Check size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <X size={14} className="text-gray-600 shrink-0" />
                        )}
                        <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(isAuthenticated ? '/signup' : '/signup')}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      plan.isPopular
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25'
                        : plan.price === 0
                        ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name} Trial`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <h2 className="text-xl font-bold text-white mb-6">Compare plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 pr-8 text-gray-400 font-medium">Feature</th>
                  {plans.map((p) => (
                    <th key={p.id} className="py-3 px-4 text-white font-medium text-center">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Stores', values: plans.map((p) => p.maxStores === -1 ? 'Unlimited' : String(p.maxStores)) },
                  { label: 'Users', values: plans.map((p) => p.maxUsers === -1 ? 'Unlimited' : String(p.maxUsers)) },
                  { label: 'Products', values: plans.map((p) => p.maxProducts === -1 ? 'Unlimited' : String(p.maxProducts)) },
                  ...plans[0]?.features.map((f) => ({
                    label: f.label,
                    values: plans.map((p) => p.features.find((pf) => pf.key === f.key)?.included ? '✓' : '—'),
                  })) || [],
                ].map((row) => (
                  <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 pr-8 text-gray-300">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`py-3 px-4 text-center font-medium ${
                        v === '✓' ? 'text-emerald-400' : v === '—' ? 'text-gray-600' : 'text-white'
                      }`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-3">Need a custom plan?</h2>
          <p className="text-sm text-gray-400 mb-6">
            We offer custom plans for large enterprises with specific requirements.
            Contact us for a personalized quote.
          </p>
          <a
            href="mailto:sales@shadowlabz.in"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10"
          >
            Contact Sales <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} ShadowLabz. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:text-gray-400 transition-colors">Home</button>
            <span>v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
