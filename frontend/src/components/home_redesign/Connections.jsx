import { Database, Shield, CheckCircle, Link } from 'lucide-react';

export function Connections() {
    return (
        <section id="connections" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl text-gray-900 mb-4 font-bold">Data Connections</h2>
                    <p className="text-gray-600 text-lg">Trusted, official sources ensuring accuracy and reliability</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-[#2D3E8F] shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B4A] to-[#FF8F6B] rounded-full flex items-center justify-center shadow-md">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl text-gray-900 mb-1 font-bold">Election Commission of India</h3>
                                <p className="text-[#FF6B4A] font-medium">Official Electoral Data Source</p>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-6 leading-relaxed">
                            All electoral roll data processed through MatSetu is sourced directly and officially from the Election Commission of India (ECI). We maintain strict protocols to ensure data integrity, authenticity, and compliance with electoral regulations.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <Database className="w-8 h-8 text-[#2D3E8F] mb-2" />
                                <h4 className="text-gray-900 mb-1 font-semibold">Official Access</h4>
                                <p className="text-gray-600 text-sm">Direct API integration with ECI databases</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <CheckCircle className="w-8 h-8 text-[#FF6B4A] mb-2" />
                                <h4 className="text-gray-900 mb-1 font-semibold">Verified Data</h4>
                                <p className="text-gray-600 text-sm">Regular validation and synchronization</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <Link className="w-8 h-8 text-[#2D3E8F] mb-2" />
                                <h4 className="text-gray-900 mb-1 font-semibold">Secure Transfer</h4>
                                <p className="text-gray-600 text-sm">Encrypted, audited data pipelines</p>
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-[#FF6B4A]/30 p-4 rounded-xl">
                            <p className="text-gray-700 text-sm">
                                <strong className="text-[#FF6B4A]">Data Compliance:</strong> MatSetu operates in full compliance with the Representation of the People Act, 1950, and all ECI guidelines regarding electoral roll data handling and privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
