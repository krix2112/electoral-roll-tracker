import { Vote, Users, Shield, TrendingUp } from 'lucide-react';

export function AboutUs() {
    return (
        <section id="about" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 justify-center">
                        <Vote className="w-8 h-8 text-[#FF6B4A]" />
                        <h2 className="text-4xl text-gray-900 font-bold">About MatSetu</h2>
                    </div>

                    <div className="space-y-8">
                        {/* Story Beginning */}
                        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-gray-200">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#FF6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-[#FF6B4A]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">The Beginning of Trust</h3>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        In a democracy where every vote matters, the integrity of electoral rolls forms the foundation of fair elections. MatSetu was born from a simple yet powerful vision: to bring complete transparency to India's electoral process and empower citizens with the tools to protect their democratic rights.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* The Challenge */}
                        <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border border-gray-200">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-[#2D3E8F]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-[#2D3E8F]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Understanding the Challenge</h3>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        For years, electoral rolls have been vulnerable to silent manipulation, invisible fraud, and opaque auditing processes. Traditional manual verification methods couldn't keep pace with sophisticated patterns of electoral irregularities spanning multiple constituencies and time periods. Citizens, activists, and watchdog organizations needed a powerful ally.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* The Solution */}
                        <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl border-2 border-[#2D3E8F]/30">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B4A] to-[#FF8F6B] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Our Mission Today</h3>
                                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                        Today, MatSetu stands as India's pioneering platform for electoral roll integrity. We leverage advanced forensic technologies, machine learning, and comprehensive data analysis to detect anomalies, track changes over time, and provide court-ready documentation. Our platform bridges the gap between complex electoral data and actionable insights, making democracy more transparent and accountable.
                                    </p>
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        With real-time monitoring across <span className="font-semibold text-[#2D3E8F]">543 constituencies</span> and tracking over <span className="font-semibold text-[#FF6B4A]">450 million registered voters</span>, MatSetu empowers every stakeholder in the democratic process to ensure that every vote counts and every voice is heard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
