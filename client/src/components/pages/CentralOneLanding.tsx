import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, X, Check, ChevronDown, ArrowRight, Monitor, Printer, Barcode,
  ShoppingCart, Package, FileText, BarChart3, Users, Truck, Settings,
  Shield, Star, Phone, Mail, MapPin, Clock, HelpCircle, BookOpen,
  Layers, Zap, TrendingUp, CreditCard, HardDrive, Wifi, Headphones,
  Briefcase, Building2, MessageSquare,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

const PROBLEMS = [
  {
    problem: 'Manual billing takes too long and leads to errors.',
    solution: 'Scan barcodes and generate invoices in seconds. No more typing prices or calculating totals by hand.',
  },
  {
    problem: 'You never know what\'s actually in stock.',
    solution: 'Real-time inventory tracking shows exact stock levels for every product, every variant, every colour.',
  },
  {
    problem: 'GST filing is confusing and time-consuming.',
    solution: 'Auto-calculated GST for every sale. Generate GSTR-1 and GSTR-3B reports with a single click.',
  },
  {
    problem: 'You lose track of pending payments from customers.',
    solution: 'Maintain customer accounts with credit limits, due dates, and automatic payment reminders.',
  },
  {
    problem: 'Staff makes mistakes with prices and discounts.',
    solution: 'Set role-based permissions. Cashiers can only bill — managers handle discounts and returns.',
  },
  {
    problem: 'No visibility into daily profits and losses.',
    solution: 'Get a complete P&L summary every day. Know exactly what you sold, what you spent, and what you earned.',
  },
];

const FEATURES = [
  { icon: Zap, title: 'Faster Billing', desc: 'Complete a sale in under 10 seconds. Scan barcode, select quantity, take payment — done.' },
  { icon: Package, title: 'Better Stock Control', desc: 'Real-time stock updates with every sale and purchase. Low-stock alerts prevent shortages.' },
  { icon: FileText, title: 'GST Billing', desc: 'Auto-calculated GST with correct HSN codes. Print GST-compliant invoices instantly.' },
  { icon: Truck, title: 'Purchase Tracking', desc: 'Record every purchase from suppliers. Track pending orders and payment status.' },
  { icon: TrendingUp, title: 'Sales Tracking', desc: 'Daily, weekly, and monthly sales reports. Know your top-selling products.' },
  { icon: Users, title: 'Customer Records', desc: 'Store customer contact, purchase history, and loyalty points. Send personalised offers.' },
  { icon: Briefcase, title: 'Supplier Records', desc: 'Manage supplier contacts, price lists, and payment terms in one place.' },
  { icon: BarChart3, title: 'Business Reports', desc: 'Sales reports, profit reports, GST reports, stock reports — all generated automatically.' },
  { icon: Clock, title: 'Daily Sales Summary', desc: 'Get an end-of-day SMS or email with total sales, payment breakdown, and top products.' },
  { icon: Layers, title: 'Multi-User Access', desc: 'Add up to 2 users. Assign roles — Owner, Manager, Cashier — with custom permissions.' },
];

const STEPS = [
  { step: '01', title: 'Book a Demo', desc: 'Call or WhatsApp us. We will show you exactly how Central One works for your business.' },
  { step: '02', title: 'Requirement Discussion', desc: 'We understand your store size, product range, billing volume, and specific needs.' },
  { step: '03', title: 'Installation', desc: 'We install the software on your computer and set up the barcode scanner and printer.' },
  { step: '04', title: 'Staff Training', desc: 'We train you and your staff on billing, stock management, reports, and daily operations.' },
  { step: '05', title: 'Start Using Central One', desc: 'Go live on the same day. Start billing, tracking stock, and managing your business.' },
];

const INCLUDED_SOFTWARE = [
  'Complete POS billing software with GST compliance',
  'Inventory and stock management module',
  'Purchase and supplier management',
  'Customer database with purchase history',
  'Daily, weekly, and monthly sales reports',
  'GST report generation (GSTR-1, GSTR-3B)',
  'Multi-user access with role-based permissions',
  'Software updates and improvements for 6 months',
];

const INCLUDED_HARDWARE = [
  { label: 'Barcode Scanner', note: '1 unit, wired USB' },
  { label: 'Thermal Bill Printer', note: '1 unit, 80mm' },
  { label: 'Barcode Label Roll', note: '1 roll' },
  { label: 'Receipt Roll', note: '1 roll' },
];

const NOT_INCLUDED = [
  'Barcode label printer is NOT included. You can purchase it separately if needed.',
  'Future barcode label rolls and receipt rolls are chargeable and can be ordered from us.',
  'Additional hardware (extra scanners, printers, label printers) can be purchased separately.',
];

const INCLUDED_SERVICES = [
  'On-site installation at your store',
  'Staff training for up to 2 users',
  'Initial data setup assistance',
  '6 months of free support (phone, WhatsApp, remote)',
  'First year of GST updates included',
];

const WHY_CHOOSE = [
  { icon: BookOpen, title: 'Easy to Learn', desc: 'Your staff can start billing within an hour of training. No complex software to master.' },
  { icon: ShoppingCart, title: 'Reliable Billing', desc: 'Generate error-free invoices with barcode scanning. No more manual pricing mistakes.' },
  { icon: Package, title: 'Better Inventory Control', desc: 'Know exactly what is in stock, what needs reordering, and what is selling fast.' },
  { icon: CreditCard, title: 'Transparent Pricing', desc: 'One-time payment of ₹15,000. No hidden fees, no surprise charges, no subscription lock-in.' },
  { icon: Zap, title: 'Quick Setup', desc: 'Book a demo today. Go live tomorrow. We handle installation, training, and data setup.' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Phone, WhatsApp, and remote support. We are here when you need us.' },
  { icon: Shield, title: 'Designed for Indian Retailers', desc: 'Built for Indian businesses — supports GST, multi-currency, Indian address formats, and more.' },
];

const FAQS = [
  {
    q: 'What hardware do I need to run Central One?',
    a: 'You need a Windows computer or laptop, the barcode scanner and thermal printer we provide, and a stable internet connection for activation and updates. The software works offline for daily billing and syncs when connected.',
  },
  {
    q: 'Is the barcode label printer included in the package?',
    a: 'No. The barcode label printer is not included in the ₹15,000 package. You can purchase it separately if you want to print your own barcode labels. The package includes a barcode scanner, thermal bill printer, one barcode label roll, and one receipt roll.',
  },
  {
    q: 'Can I use my existing barcode scanner or printer?',
    a: 'Yes, Central One works with most standard barcode scanners and thermal printers available in the market. Our team will help configure your existing hardware during installation.',
  },
  {
    q: 'How is Central One installed?',
    a: 'We install the software on your Windows computer. Our team handles the complete setup, including configuring the barcode scanner, printer, and network settings. Installation takes about 1-2 hours.',
  },
  {
    q: 'Can I install Central One on multiple computers?',
    a: 'The Business Essentials package is for a single computer. If you need the software on multiple computers within the same store, contact us for a custom quote.',
  },
  {
    q: 'How many users can use Central One?',
    a: 'The Business Essentials package supports up to 2 users. Each user gets their own login with role-based permissions. You can add more users by upgrading your plan.',
  },
  {
    q: 'Can I add more users later?',
    a: 'Yes. Additional users beyond the 2-user limit can be added at an extra cost. Contact our sales team for pricing on additional user licenses.',
  },
  {
    q: 'What is the total cost of Central One?',
    a: 'The Business Essentials package costs ₹15,000 (one-time payment). This includes the complete software, hardware (barcode scanner, thermal printer, one barcode label roll, one receipt roll), installation, staff training, and 6 months of support.',
  },
  {
    q: 'Are there any monthly or annual charges?',
    a: 'There are no mandatory monthly charges. After the first 6 months, you have the option to subscribe to the Central Care Plan at ₹5,999 per year for continued support and updates. This is optional but recommended.',
  },
  {
    q: 'What is the Central Care Plan?',
    a: 'The Central Care Plan is our annual support and maintenance plan costing ₹5,999 per year. It includes business support, software improvements, GST updates, data backup assistance, remote troubleshooting, configuration changes, and priority support.',
  },
  {
    q: 'Is the Central Care Plan mandatory?',
    a: 'No, the Central Care Plan is optional. However, without it, you will not receive software updates, GST compliance changes, or technical support after the first 6 months.',
  },
  {
    q: 'What happens if I do not renew the Care Plan?',
    a: 'Your software will continue to work as is. However, you will not receive new features, GST rate updates, or technical support. If you face any issues later, you can renew the Care Plan at any time.',
  },
  {
    q: 'Is my data safe with Central One?',
    a: 'Yes. Your data is stored locally on your computer. We also provide optional cloud backup. You have full ownership of your data at all times.',
  },
  {
    q: 'Can I lose my data if my computer crashes?',
    a: 'We recommend regular backups. The Central Care Plan includes data backup assistance. You can also enable automatic cloud backup for an additional fee.',
  },
  {
    q: 'How does billing work?',
    a: 'Scan a product barcode, and the item name and price appear automatically. Select quantity, apply any discount, choose payment method (Cash, UPI, Card, or Credit), and print the invoice. The entire process takes under 10 seconds.',
  },
  {
    q: 'Can I create estimates or quotations?',
    a: 'Yes, Central One allows you to create estimates and quotations for customers. These can later be converted into invoices when the customer confirms the order.',
  },
  {
    q: 'Can I edit or cancel an invoice after printing?',
    a: 'Yes, you can edit or cancel invoices. Cancelled invoices are recorded in the system for audit purposes. Role-based permissions control who can edit or cancel invoices.',
  },
  {
    q: 'Does Central One support GST?',
    a: 'Yes, Central One is fully GST-compliant. It auto-calculates CGST, SGST, and IGST based on the product HSN code. You can generate GST reports for filing returns.',
  },
  {
    q: 'Can I generate GSTR-1 and GSTR-3B reports?',
    a: 'Yes. Central One generates GSTR-1 (outward supply) and GSTR-3B (summary return) reports. You can export them as Excel or PDF for CA filing.',
  },
  {
    q: 'What reports are available?',
    a: 'Central One provides sales reports (daily, weekly, monthly, custom range), profit reports, stock reports, GST reports, purchase reports, customer reports, and supplier reports. All reports can be exported as PDF or Excel.',
  },
  {
    q: 'Can I view daily sales without opening the software?',
    a: 'Yes. You can receive an end-of-day SMS or email with a summary of total sales, payment method breakdown, top-selling products, and item counts.',
  },
  {
    q: 'What kind of support do you provide?',
    a: 'We provide phone support, WhatsApp support, and remote desktop assistance. During the first 6 months, support is free. After that, the Central Care Plan covers priority support.',
  },
  {
    q: 'Can you help if I switch from another software?',
    a: 'Yes. We assist with data migration from your existing software. Contact us before purchasing to discuss migration requirements and feasibility.',
  },
  {
    q: 'Can Central One handle multiple stores?',
    a: 'The Business Essentials package is designed for a single store. If you have multiple stores and need a consolidated view, contact us for our multi-store solution.',
  },
  {
    q: 'Can the software be customised for my business?',
    a: 'Basic customisations such as invoice format, additional report fields, and specific workflow adjustments are included. Major customisations are charged separately. Contact us to discuss your requirements.',
  },
];

const BUSINESS_TYPES = [
  'Garment / Clothing Store',
  'Electronics / Mobile Shop',
  'Grocery / Supermarket',
  'Pharmacy / Medical Store',
  'Hardware Store',
  'Furniture Showroom',
  'Footwear Store',
  'Jewellery Shop',
  'General Retail',
  'Wholesale / Distribution',
  'Other',
];

function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12 md:mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function FAQItem({ question, answer, open, onToggle }: {
  question: string; answer: string; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function CentralOneLanding() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({
    businessName: '', ownerName: '', phone: '', email: '', city: '', businessType: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      setForm({ businessName: '', ownerName: '', phone: '', email: '', city: '', businessType: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`html{scroll-behavior:smooth}`}</style>

      {/* Sticky Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                <Monitor size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Central One</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo('contact')}
                className="ml-3 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Book Demo
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2 shadow-lg">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
            >
              Book Demo
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Trusted by retail businesses across India
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                Your entire retail business,
                <br />
                <span className="text-blue-600">in one software.</span>
              </h1>
              <p className="mt-5 text-lg text-gray-500 max-w-lg leading-relaxed">
                Central One is the complete POS and inventory management system for Indian retailers.
                Billing, stock control, GST reports, purchase tracking, and business analytics —
                everything you need to run your store efficiently.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={() => scrollTo('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all"
                >
                  Book a Demo <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => scrollTo('pricing')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-all"
                >
                  Request Pricing
                </button>
              </div>
              <div className="flex items-center gap-5 mt-8 text-sm text-gray-400">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> One-time payment</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Hardware included</span>
                <span className="flex items-center gap-1.5"><Check size={14} className="text-green-500" /> Free training</span>
              </div>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium ml-2">Central One — Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Today's Sales", value: '₹12,450', change: '+18%', color: 'text-green-600' },
                    { label: 'Orders', value: '24', change: '+5', color: 'text-blue-600' },
                    { label: 'Low Stock', value: '3', change: '-2', color: 'text-amber-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
                      <p className={`text-[10px] font-medium ${s.color}`}>{s.change} today</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { product: 'Cotton Kurti', sku: 'KT-001', qty: '2', total: '₹1,598', status: 'Completed' },
                    { product: 'Silk Saree', sku: 'SR-042', qty: '1', total: '₹2,499', status: 'Completed' },
                    { product: 'Casual Shirt', sku: 'CS-118', qty: '3', total: '₹2,097', status: 'Pending' },
                  ].map((item) => (
                    <div key={item.sku} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product}</p>
                          <p className="text-[10px] text-gray-400">{item.sku} × {item.qty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{item.total}</p>
                        <p className={`text-[10px] font-medium ${item.status === 'Completed' ? 'text-green-600' : 'text-amber-600'}`}>{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <Barcode size={20} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Barcode Scanner</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <Printer size={20} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Bill Printer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <Section id="problems" className="bg-gray-50">
        <SectionHeading title="Running a retail store is hard. We make it easy." subtitle="Real problems that every retailer faces — and how Central One solves them." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((item) => (
            <div key={item.problem} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <p className="text-xs font-semibold text-red-500 mb-2">The Problem</p>
              <p className="text-sm font-medium text-gray-900 mb-3">{item.problem}</p>
              <div className="h-px bg-gray-100 my-3" />
              <p className="text-xs font-semibold text-green-600 mb-2">How Central One Helps</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.solution}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section id="features">
        <SectionHeading title="Everything you need to run your store" subtitle="Ten powerful modules that cover every aspect of your retail business." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <f.icon size={20} className="text-blue-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how-it-works" className="bg-gray-50">
        <SectionHeading title="From demo to going live in one day" subtitle="We make onboarding simple. Here is exactly what happens." />
        <div className="max-w-3xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.step} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold shrink-0">
                  {step.step}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className={`pb-8 ${i === STEPS.length - 1 ? 'pb-0' : ''}`}>
                <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* What's Included */}
      <Section id="included">
        <SectionHeading title="What you get with Central One" subtitle="Everything included in the Business Essentials package — no surprises." />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Monitor size={20} className="text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Software Includes</h3>
            </div>
            <ul className="space-y-2.5">
              {INCLUDED_SOFTWARE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <HardDrive size={20} className="text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Hardware Includes</h3>
            </div>
            <ul className="space-y-2.5 mb-4">
              {INCLUDED_HARDWARE.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="text-gray-400"> — {item.note}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1.5">
              {NOT_INCLUDED.map((item) => (
                <p key={item} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">•</span>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Headphones size={20} className="text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Services Includes</h3>
            </div>
            <ul className="space-y-2.5">
              {INCLUDED_SERVICES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" className="bg-gray-50">
        <SectionHeading title="Simple, one-time pricing" subtitle="Pay once. Own it forever. No monthly subscription, no hidden fees." />
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-xl shadow-blue-500/5 overflow-hidden">
            <div className="bg-blue-600 px-6 py-3 text-center">
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Most Popular</span>
            </div>
            <div className="p-6 md:p-8">
              <div className="text-center">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Package</p>
                <h3 className="text-2xl font-bold text-gray-900">Business Essentials</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">₹15,000</span>
                  <span className="text-gray-400 text-sm ml-1">one-time</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Perfect for small and growing retail businesses.</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">What's Included</p>
                {[
                  'Complete POS software with billing and inventory',
                  'Up to 2 users with role-based access',
                  'Barcode scanner (1 unit)',
                  'Thermal bill printer (1 unit)',
                  '1 barcode label roll + 1 receipt roll',
                  'On-site installation and setup',
                  'Staff training (up to 2 users)',
                  'Initial data setup assistance',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollTo('contact')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all"
              >
                Book a Demo Now
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Shield size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Central Care Plan</h3>
                <p className="text-xs text-gray-500">Optional annual support and maintenance</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹5,999</span>
              <span className="text-gray-400 text-sm">/year (after first 6 months)</span>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              First <strong className="text-gray-900">6 months of support</strong> are included with your purchase.
              After that, the Central Care Plan covers:
            </div>
            <ul className="space-y-2">
              {[
                'Business support when issues occur',
                'Software improvements and new features',
                'GST rate updates and compliance changes',
                'Data backup assistance',
                'Remote troubleshooting',
                'Configuration changes and customisation help',
                'Priority support — faster response times',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Why Choose Central One */}
      <Section id="why-choose">
        <SectionHeading title="Why retail businesses choose Central One" subtitle="Built for Indian retailers. Backed by real support. Priced for small businesses." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {WHY_CHOOSE.map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <item.icon size={18} className="text-blue-600" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="bg-gray-50">
        <SectionHeading title="Frequently asked questions" subtitle="Everything you need to know about Central One." />
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.q}
              answer={faq.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact">
        <SectionHeading title="Ready to get started?" subtitle="Book a free demo. We will call you within 24 hours." />
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="text-center py-12 bg-green-50 border border-green-200 rounded-2xl">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Thank You!</h3>
              <p className="text-sm text-gray-600 mt-1">We have received your enquiry. Our team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name *</label>
                  <input
                    required
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="My Store"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Owner Name *</label>
                  <input
                    required
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+91-9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="owner@mystore.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type *</label>
                  <select
                    required
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your store and requirements..."
                />
              </div>
              <button
                type="submit"
                className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Book a Demo
              </button>
            </form>
          )}
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  <Monitor size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white">Central One</span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                Complete POS and inventory management software for Indian retail businesses.
                Billing, stock control, GST reports, and more.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Quick Links</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'Features', id: 'features' },
                  { label: 'Pricing', id: 'pricing' },
                  { label: 'FAQ', id: 'faq' },
                  { label: 'Contact', id: 'contact' },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollTo(link.id)}
                    className="block text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Support</h4>
              <div className="space-y-2.5">
                <a href="tel:+919839191710" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                  <Phone size={14} /> +91 9839191710
                </a>
                <a href="mailto:contact@shadowlabz.in" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                  <Mail size={14} /> contact@shadowlabz.in
                </a>
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} /> Kaimganj, Uttar Pradesh
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Legal</h4>
              <div className="space-y-2.5">
                <button onClick={() => navigate('/privacy')} className="block text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/terms')} className="block text-sm text-gray-500 hover:text-white transition-colors">Terms & Conditions</button>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <span>&copy; {new Date().getFullYear()} ShadowLabz. All rights reserved.</span>
            <span>Built for Indian retail businesses.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
