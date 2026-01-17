import logo from '../../assets/logo-new.png';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlareHover from '../ui/GlareHover';

export function Hero() {
    return (
        <section className="bg-gradient-to-b from-white to-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-5xl mx-auto">
                    {/* Large Logo */}
                    <div className="flex items-center justify-center mb-10">
                        <img src={logo} alt="MatSetu" className="h-24" />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
                        <span className="text-[#FF6B4A] font-semibold tracking-wide uppercase text-sm">Revolutionary Electoral Platform</span>
                        <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
                    </div>

                    <h1 className="text-6xl md:text-7xl mb-8 text-gray-900 font-bold leading-tight">
                        The <span className="text-[#FF6B4A]">Electoral Roll</span> for your <span className="text-[#2D3E8F]">Democracy</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-14 leading-relaxed max-w-4xl mx-auto">
                        A unified platform for transparent electoral roll management — ensuring integrity, detecting anomalies, and maintaining democratic trust across India
                    </p>

                    <div className="flex items-center justify-center gap-6 mb-10">
                        <Link to="/dashboard">
                            <GlareHover
                                background="linear-gradient(to right, #2D3E8F, #4A5FB5)"
                                glareColor="#ffffff"
                                glareOpacity={0.3}
                                transitionDuration={500}
                            >
                                <button className="px-10 py-4 text-white font-medium text-lg">
                                    Launch Dashboard
                                </button>
                            </GlareHover>
                        </Link>
                        <Link to="/compare">
                            <GlareHover
                                background="#ffffff"
                                borderColor="#2D3E8F"
                                glareColor="#2D3E8F"
                                glareOpacity={0.2}
                                transitionDuration={500}
                            >
                                <button className="px-10 py-4 text-[#2D3E8F] font-medium text-lg border-2 border-[#2D3E8F] rounded-full">
                                    Compare Rolls
                                </button>
                            </GlareHover>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
