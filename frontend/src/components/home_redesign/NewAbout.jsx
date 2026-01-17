import { Shield, Target, Zap } from 'lucide-react';

export function NewAbout() {
    return (
        <section id="about" className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 mb-8 shadow-sm">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 text-sm font-semibold tracking-wide">About MatSetu</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Building Trust in
                            <span className="block text-[#FF6B4A]">Electoral Systems</span>
                        </h2>

                        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                            MatSetu was born from a simple yet powerful vision: every citizen deserves
                            confidence that their vote counts. We leverage cutting-edge AI and data
                            analytics to bring unprecedented transparency to electoral roll management.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold mb-1">Data Integrity</h3>
                                    <p className="text-gray-500 text-sm">End-to-end verification ensuring data remains tamper-proof and trustworthy.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                                    <Target className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold mb-1">Precision Detection</h3>
                                    <p className="text-gray-500 text-sm">Advanced algorithms that spot anomalies human review would miss.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold mb-1">Real-time Analysis</h3>
                                    <p className="text-gray-500 text-sm">Instant processing of millions of records with live anomaly alerts.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual */}
                    <div className="relative">
                        <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="relative z-10">
                                <div className="text-5xl font-bold text-[#2D3E8F] mb-2">ECI</div>
                                <div className="text-gray-500 mb-8">Election Commission of India</div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <span className="text-gray-600">Official Data Source</span>
                                        <span className="text-green-500 font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <span className="text-gray-600">Secure Transfer</span>
                                        <span className="text-green-500 font-medium">✓ Encrypted</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <span className="text-gray-600">Audit Trail</span>
                                        <span className="text-green-500 font-medium">✓ Complete</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
