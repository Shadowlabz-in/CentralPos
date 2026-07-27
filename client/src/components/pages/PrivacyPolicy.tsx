import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: July 2025</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
          <p>
            ShadowLabz ("we", "our", "us") operates the Central One software and website. This policy explains how we collect, use, and protect your personal information.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>When you submit a demo request or contact us, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Business name and owner name</li>
            <li>Phone number and email address</li>
            <li>City and business type</li>
            <li>Any additional information you provide in messages</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>We use your information solely for:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Responding to your demo requests and enquiries</li>
            <li>Providing software installation, training, and support</li>
            <li>Sending essential service-related communications</li>
            <li>Improving our products and services</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely on our servers. We implement reasonable security measures to protect your information from unauthorized access, alteration, or destruction.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">4. Data Sharing</h2>
          <p>
            We do not sell, trade, or share your personal information with third parties except as required by law or with your explicit consent.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">5. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to fulfill the purposes outlined in this policy, or as required by applicable law.
          </p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>File a complaint with relevant authorities</li>
          </ul>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">7. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at{' '}
            <a href="mailto:contact@shadowlabz.in" className="text-blue-600 hover:underline">contact@shadowlabz.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
