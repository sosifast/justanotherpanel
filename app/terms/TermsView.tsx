'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Shield, Scale, ScrollText, CreditCard, Lock, Mail, AlertTriangle, FileText, Cookie, RefreshCw } from 'lucide-react';
import Footer from '@/components/Footer';

const TermsPage = ({ settings }: { settings: any }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const siteName = settings?.site_name || "JustAnotherPanel";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const sections = [
        {
            id: 'delivery',
            icon: <FileText className="w-5 h-5" />,
            title: 'Delivery Policy',
            content: [
                'During ordering our services, you agree to follow our services. Later we will not consider your knowledge about that.',
                'The authority holds the right to update or modifies the terms and condition without prior announcement. Read these with patience to avoid unwanted incidents.',
                'You should use the JustAnotherPanel services in an effective way that complies with the terms agreed to when you joined the site. These include those posted by the social networks themselves when you signed up.',
                'As the rate of services changes from time to time, it may reflect in the features of terms and conditions.',
                'The delivery duration may differ depending on the number of orders. However, our system can provide you with an estimated time duration of the delivery. If you get the delivery after that duration, will get a refund.',
                'We are constantly updating the standard of its reseller. To meet the market demand, the authority holds the right to update the service type.',
            ]
        },
        {
            id: 'violations',
            icon: <Shield className="w-5 h-5" />,
            title: 'Terms Violations',
            content: [
                'Our decisions in breaking the code of conduct are permanent. After getting you to break the terms and conditions, we will:',
            ],
            list: [
                'Stop providing services to you',
                'Not explain the reasons for your suspension to keep our privacy',
                'Return your remaining balance in the website wallet to the payment gateway that you used to pay us. You can contact our authorized support executives for more queries.',
            ],
            additional: [
                'As you control every aspect of your business, JustAnotherPanel will not be accountable for your professional losses.',
                'JustAnotherPanel will not take the liability for suspending or removing your content that is done by social media authorized managers.',
            ]
        },
        {
            id: 'service',
            icon: <FileText className="w-5 h-5" />,
            title: 'Service Policy',
            content: [
                'JustAnotherPanel strives to promote including YouTube, Soundcloud, Vine, Pinterest, etc. strengthening clients\' social media account appearances only.',
                'The follower interaction with customer social media accounts is not guaranteed. You are guaranteed about getting followers according to your payments.',
                'It is not guaranteed that every account will have an image, bio, content, etc. However, our goal is to make the account real as much as possible.',
                'You are requested not to upload prohibited and adult material in the JustAnotherPanel. Try to upload content that matches the standard of social media including YouTube or Soundcloud or Vine or Pinterest.',
                'The system cannot determine data about your lost engagement need, or any other social media points. As we do not know where your social media points are lost, you cannot use the services as your refill strategy.',
            ]
        },
        {
            id: 'payment',
            icon: <CreditCard className="w-5 h-5" />,
            title: 'Payment and Refund Policy',
            content: [
                'Before placing or submitting an order, you have to deposit credit or funds. You can add funds or make payments via popular payment gateways such as VISA/Master Card, Webmoney, Perfectmoney, Payoneer, Payeer, Bitcoin, and Paytm.',
                'First, sign up on the JustAnotherPanel website. Then go to add fund page and choose your payment gateway. After that deposit your credit. After completing the successful payment, the credit will be deposited into your wallet within a few minutes.',
                'For getting a refund, you need to contact the support executive. After reviewing your deposit details and opinion, our team will refund you as soon as possible through the payment gateway that you use during depositing the balance.',
                'You will get the balance after deducting the deposit or redeeming bonus that some users get during adding funds or credit to the JustAnotherPanel website. Getting a refund depends on your local bank or card company facilities.',
                'You will not get back your money through Webmoney or PerfectMoney or Crypto deposits. We only refund through bank or card deposited balance.',
                'File a dispute without at least one valid cause after the deposit may result in closing your current and future orders. JustAnotherPanel holds the right to ban your account in that case or take away its delivered followers from the client\'s Instagram, FB, Twitter, or other social media account.',
                'After getting a request from a customer, the authority will cancel the request or refund. If the team is unable to deliver orders, as a customer, you get credit in your JustAnotherPanel account.',
                'After completing the order, JustAnotherPanel will not be responsible for the order\'s social media broken URL, username, account termination, etc. In that case, as a customer, you will not get a refund from the authority of the site.',
                'The authority does not refund an order associated with a misplaced or private social media account. Be alert during placing an order.',
                'Payments with insidious payment gateways or stolen cards will result in the termination of the JustAnotherPanel user account.',
                'For ensuring better results and safety, it is recommended to use one server for the same webpage at a time. Otherwise, you will fail to acquire the correct number of followers and likes. The refund balance will not add to your card or bank account.',
            ]
        },
        {
            id: 'privacy',
            icon: <Lock className="w-5 h-5" />,
            title: 'Privacy & Data',
            content: [
                'Violation of privacy policies may become an enemy between you and our reputation. To avoid unwanted and unexpected breaks up with you, we maintain uncompromised privacy policies.',
                'Sometimes, our system may utilize your shared data by validating your concern in your browser. By ordering from JustAnotherPanel, you agree with the terms and privacy policies.',
                'JustAnotherPanel developed a data composition system for its users to make better choices about their data. During visiting, using, or continuing to use the site or any of the services listed on our site, you will accept all of the conditions and restrictions on our Privacy Policy.',
            ],
            subTitle: 'User Data We Collect',
            listItems: [
                'Email',
                'Skype ID',
                'IP Address',
                'Phone Number',
                'User and Brand Name',
                'Social Media User Name',
                'Use preferences and cookie history',
            ]
        },
        {
            id: 'cookies',
            icon: <Cookie className="w-5 h-5" />,
            title: 'Cookie Policy',
            content: [
                'A cookie refers to short pieces of data stored on the hard drive in a computer. Sometimes, our system compiles data from your digital devices that allow us to store data about your surfing habits and other info you may have shared on the site.',
                'Our cookies are employed to ensure trouble-free use of JustAnotherPanel. We utilize cookies to track the behavior of users and display content that is relevant to them.',
                'The collected data is used for marketing, analysis, and statistical purposes. We use cookies that are strictly essential for the technical management of the system as well as the site. You can configure this setting through your web browser.',
                'A cookie is a method of passing data between a server and a web browser. To control sharing, you can simply modify the browser to block or delete cookies. To "Manage Cookies" or "Set Cookies Policy" in the browser section of the tool.',
                'A browser can be configured to allow access to cookies from diverse websites but not others, to ensure the use of cookies that may be set by websites without your concern, or to notify you when a cookie has been installed on. By default, most browsers are developed to allow cookies.',
            ]
        },
        {
            id: 'security',
            icon: <Shield className="w-5 h-5" />,
            title: 'Data Security',
            content: [
                'JustAnotherPanel values your privacy and does not utilize your data (for example email address or phone number) for any purpose other than to provide you with data about the services. We also do not use any contact information for our marketing purposes.',
                'The encryption process for the payment information is secure because it uses SSL technology.',
            ]
        },
        {
            id: 'updates',
            icon: <RefreshCw className="w-5 h-5" />,
            title: 'System Updates',
            content: [
                'JustAnotherPanel can update, modify or change every aspect of its system. The brand may make changes in the policies without a prior announcement. The updated rules will work after posting on the official website.',
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500 selection:text-white relative overflow-x-hidden">

            {/* Grid Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
            </div>

            {/* Header */}
            <header className={`fixed w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200 py-3' : 'bg-transparent border-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="flex items-center gap-2 group" aria-label={`${siteName} Home`}>
                            {settings?.logo_imagekit_url ? (
                                <img src={settings.logo_imagekit_url} alt={siteName} className="h-9 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
                                        {siteName.charAt(0)}
                                    </div>
                                    <span className="font-bold text-xl tracking-tight text-slate-900">{siteName}</span>
                                </>
                            )}
                        </Link>

                        <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
                            <Link href="/#services" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Services</Link>
                            <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                            <Link href="/#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Why Us</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-3">
                            <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
                            <Link href="/auth/register" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all inline-flex items-center justify-center">
                                Get Started
                            </Link>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-slate-900 p-2"
                                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <nav className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 py-4 px-4 flex flex-col space-y-4 shadow-lg" aria-label="Mobile Navigation">
                        <Link href="/#services" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Services</Link>
                        <Link href="/#features" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link href="/#about" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Why Us</Link>
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                            <Link href="/auth/login" className="text-slate-900 font-semibold text-left">Login</Link>
                            <Link href="/auth/register" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium text-center">Sign Up</Link>
                        </div>
                    </nav>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto">

                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6">
                            <FileText className="w-3 h-3" />
                            Legal
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Confidence comes from clarity. Please read our terms and conditions carefully before using our services.
                        </p>
                        <p className="text-sm text-slate-400 mt-4">Last updated: January 2026</p>
                    </div>

                    {/* Table of Contents */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mb-12">
                        <h2 className="font-bold text-slate-900 mb-4">Table of Contents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {sections.map((section, index) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors py-1"
                                >
                                    <span className="text-slate-400">{index + 1}.</span>
                                    {section.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-12">
                        {sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-32">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                                </div>

                                <div className="space-y-4 text-slate-600 leading-relaxed">
                                    {section.content.map((paragraph, idx) => (
                                        <p key={idx}>{paragraph}</p>
                                    ))}

                                    {section.list && (
                                        <ul className="list-disc list-inside space-y-2 pl-4">
                                            {section.list.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.additional && section.additional.map((text, idx) => (
                                        <p key={idx}>{text}</p>
                                    ))}

                                    {section.subTitle && (
                                        <div className="mt-6">
                                            <h3 className="font-semibold text-slate-900 mb-3">{section.subTitle}</h3>
                                            <ul className="list-disc list-inside space-y-1 pl-4">
                                                {section.listItems?.map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Contact Box */}
                    <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Have Questions?</h3>
                        <p className="text-slate-300 mb-6">If you have any questions about our terms of service, please contact our support team.</p>
                        <Link href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer settings={settings} />
        </div>
    );
};

export default TermsPage;
