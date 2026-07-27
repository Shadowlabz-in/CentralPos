import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsAndConditions() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="text-sm text-gray-500">Last updated: July 2025</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p>
            These terms and conditions govern your purchase and use of Central One software and services from ShadowLabz. By purchasing or using our products, you agree to these terms.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">1. Software License</h2>
          <p>
            Upon purchase of the Business Essentials package, you are granted a non-exclusive, non-transferable license to use Central One software on a single computer at your business location. The license is for a maximum of 2 users unless additional user licenses are purchased.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">2. Hardware Warranty</h2>
          <p>
            The hardware provided (barcode scanner and thermal printer) carries a 6-month warranty against manufacturing defects. Warranty does not cover physical damage, misuse, or normal wear and tear. Barcode label rolls and receipt rolls are consumables and are not covered under warranty.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">3. Payment Terms</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>The Business Essentials package is a one-time payment of ₹15,000 (inclusive of all taxes).</li>
            <li>Payment is due at the time of purchase.</li>
            <li>The Central Care Plan (₹5,999/year) is optional and billed annually.</li>
            <li>Additional hardware, consumables, and user licenses are charged separately.</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">4. Installation and Training</h2>
          <p>
            We provide on-site installation and staff training as part of the package. Installation is contingent upon a working Windows computer and stable internet at the customer's premises. Training covers up to 2 users and basic daily operations.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">5. Support and Maintenance</h2>
          <p>
            The first 6 months of support are included. After this period, the Central Care Plan (₹5,999/year) provides continued support, software updates, GST compliance updates, and priority assistance. Without the Care Plan, support is available on a paid basis.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">6. Refund Policy</h2>
          <p>
            Since our product involves hardware and on-site installation, refunds are handled on a case-by-case basis. If the software does not function as advertised, we will work to resolve the issue. Refund requests must be made within 7 days of purchase.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">7. Data Ownership</h2>
          <p>
            You retain full ownership of all business data entered into Central One. We do not access, use, or share your data except for providing technical support with your explicit permission. We recommend regular backups of your data.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">8. Limitation of Liability</h2>
          <p>
            ShadowLabz shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use Central One software or hardware. Our total liability is limited to the amount paid for the product.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">9. Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Customers will be notified of significant changes via email. Continued use of the software after changes constitutes acceptance of the updated terms.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">10. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Kaimganj, Uttar Pradesh.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">11. Contact</h2>
          <p>
            For questions about these terms, contact us at{' '}
            <a href="mailto:contact@shadowlabz.in" className="text-blue-600 hover:underline">contact@shadowlabz.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
