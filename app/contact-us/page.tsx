import { Metadata } from 'next';
import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    return {
        title: `Contact Us | ${siteName}`,
        description: `Get in touch with ${siteName}. Contact us via WhatsApp, email, or visit our office. We're here to help with your SMM needs.`,
        keywords: 'contact, support, WhatsApp, email, SMM panel help',
    };
}

export default async function ContactPage() {
    const settings = await getSettings();
    const siteName = settings?.site_name || 'JustAnotherPanel';
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        We're here to help! Reach out to us through any of our contact channels and we'll get back to you as soon as possible.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Have questions about our SMM services? Need help with your account? Our support team is ready to assist you.
                            </p>
                        </div>

                        {/* Contact Methods */}
                        <div className="space-y-6">
                            {/* WhatsApp */}
                            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-2">WhatsApp Support</h3>
                                    <p className="text-slate-600 mb-3">Fastest response time for urgent inquiries</p>
                                    <Link
                                        href="https://wa.me/6288293334443"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        +62 882-9333-4443
                                    </Link>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-2">Email Support</h3>
                                    <p className="text-slate-600 mb-3">For detailed inquiries and documentation</p>
                                    <Link
                                        href="mailto:info@apkey.net"
                                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        info@apkey.net
                                    </Link>
                                </div>
                            </div>

                            {/* Response Time */}
                            <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-2">Response Time</h3>
                                    <p className="text-slate-600 mb-2">We typically respond within:</p>
                                    <ul className="text-sm text-slate-600 space-y-1">
                                        <li>• WhatsApp: 5-15 minutes</li>
                                        <li>• Email: 1-2 hours during business hours</li>
                                        <li>• Maximum: 24 hours on weekends</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h3 className="font-semibold text-slate-900 mb-3">Support Hours</h3>
                            <p className="text-slate-600 text-sm mb-2">
                                Our support team is available 24/7 to assist you with any questions or concerns.
                            </p>
                            <p className="text-slate-600 text-sm">
                                For the fastest response, we recommend using WhatsApp for urgent matters.
                            </p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Find answers to common questions about our services and platform.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-3">How quickly will I receive my order?</h3>
                                <p className="text-slate-600 text-sm">
                                    Most orders start within minutes and complete within hours. Delivery time depends on the service type and quantity ordered.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-3">Is it safe to use SMM services?</h3>
                                <p className="text-slate-600 text-sm">
                                    We use only safe, high-quality methods that comply with platform guidelines. Your account security is our top priority.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-3">What payment methods do you accept?</h3>
                                <p className="text-slate-600 text-sm">
                                    We accept PayPal, Cryptomus (cryptocurrency), and manual bank transfers. All payments are processed securely.
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-3">Can I get a refund?</h3>
                                <p className="text-slate-600 text-sm">
                                    Yes, we offer refunds for undelivered services. Please contact our support team within 7 days of placing your order.
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 text-center">
                            <h3 className="font-bold text-slate-900 mb-3">Ready to Get Started?</h3>
                            <p className="text-slate-600 text-sm mb-4">
                                Join thousands of satisfied customers who trust {siteName} for their social media growth.
                            </p>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}