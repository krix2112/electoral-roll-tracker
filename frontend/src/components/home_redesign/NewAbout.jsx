import { Shield, Target, Zap } from 'lucide-react';

export function NewAbout() {
    return (
        <section id="about" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 mb-8 shadow-sm">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 text-sm font-semibold tracking-wide">About MatSetu</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Building Trust in <span className="text-[#FF6B4A]">Electoral Systems</span>
                    </h2>

                    <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
                        MatSetu was born from a simple yet powerful vision: every citizen deserves confidence that their vote counts. We leverage cutting-edge AI and data analytics to bring unprecedented transparency to electoral roll management.
                    </p>
                </div>

                {/* 3 Feature Boxes */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {/* Box 1: Data Integration */}
                    <div className="p-8 rounded-xl bg-[#E8F4F8] shadow-[0_4px_16px_rgba(45,62,143,0.5)] hover:shadow-[0_8px_24px_rgba(45,62,143,0.6)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm">
                            <Shield className="w-6 h-6 text-[#1B3A5C]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1B3A5C] mb-3">Data Integration</h3>
                        <p className="text-[#1B3A5C]/70 leading-relaxed">
                            Seamlessly aggregate electoral data from diverse sources into a unified, verified structure.
                        </p>
                    </div>

                    {/* Box 2: Precision Detection */}
                    <div className="p-8 rounded-xl bg-[#F5F5F0] shadow-[0_4px_16px_rgba(212,160,58,0.5)] hover:shadow-[0_8px_24px_rgba(212,160,58,0.6)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm">
                            <Target className="w-6 h-6 text-[#D4A03A]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1B3A5C] mb-3">Precision Detection</h3>
                        <p className="text-[#1B3A5C]/70 leading-relaxed">
                            Advanced pattern recognition algorithms that identify anomalies with pinpoint accuracy.
                        </p>
                    </div>

                    {/* Box 3: Real-time Analysis */}
                    <div className="p-8 rounded-xl bg-[#E8F6F6] shadow-[0_4px_16px_rgba(74,155,155,0.5)] hover:shadow-[0_8px_24px_rgba(74,155,155,0.6)] hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm">
                            <Zap className="w-6 h-6 text-[#4A9B9B]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#1B3A5C] mb-3">Real-time Analysis</h3>
                        <p className="text-[#1B3A5C]/70 leading-relaxed">
                            Live monitoring and instant processing of voter roll changes as they happen.
                        </p>
                    </div>
                </div>

                {/* MatSetu Button */}
                <div className="text-center">
                    <button className="px-8 py-3 bg-[#1B3A5C] text-white rounded-[50px] font-semibold shadow-[0_4px_12px_rgba(27,58,92,0.3)] hover:bg-[#4A9B9B] hover:shadow-[0_8px_20px_rgba(74,155,155,0.4)] hover:-translate-y-0.5 active:bg-[#0F1F2E] active:shadow-[0_2px_8px_rgba(27,58,92,0.25)] active:scale-98 active:translate-y-1 transition-all duration-300">
                        Learn More About MatSetu
                    </button>
                </div>
            </div>
        </section>
    );
}
