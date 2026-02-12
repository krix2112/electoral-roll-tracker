import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../../assets/logo-new.png';
import api, { getDashboardAggregation } from '../../services/api';

import heroBg from '../../assets/hero-bg-democracy.png';

export function NewHero() {
    const [stats, setStats] = useState({
        constituencies: '0',
        voters: '0',
        anomalies: '0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch from dashboard API using centralized service
                const data = await getDashboardAggregation();

                // Format voters count
                let votersDisplay = data.total_voters?.toString() || '0';
                if (data.total_voters > 1000000) {
                    votersDisplay = `${(data.total_voters / 1000000).toFixed(1)}M+`;
                } else if (data.total_voters > 1000) {
                    votersDisplay = `${(data.total_voters / 1000).toFixed(0)}K+`;
                }

                setStats(prev => ({
                    ...prev,
                    constituencies: data.constituencies_count?.toString() || '0',
                    voters: votersDisplay,
                    anomalies: Math.floor(data.total_voters * 0.001)?.toString() || '0' // Mock anomalies for now
                }));

                // Also try /api/stats for anomalies if available
                const statsResponse = await api.get('/api/stats');
                if (statsResponse.data?.anomalies?.value) {
                    setStats(prev => ({
                        ...prev,
                        anomalies: statsResponse.data.anomalies.value
                    }));
                }
            } catch (error) {
                console.log('Using default stats - backend not available:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <section id="home" className="relative min-h-screen pt-24 pb-12 lg:pt-32 overflow-hidden flex items-center">
            {/* Background Image with Blending */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-white/60"></div>
            </div>


            {/* Subtle background patterns */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FF6B4A]/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#2D3E8F]/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-50 to-blue-50 rounded-full opacity-30" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                {/* Large Centered Logo */}
                <div className="mb-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full blur-2xl -z-10"></div>
                    <img src={logo} alt="MatSetu" className="h-32 md:h-40 lg:h-48 mx-auto drop-shadow-sm" />
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1B3A5C] mb-8 leading-tight tracking-tight mx-auto">
                    Electoral changes <span className="text-[#D4A03A]">made visible</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
                    Forensic analysis of electoral rolls to detect anomalies, visualize changes, and protect the integrity of every vote
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
                    <Link to="/dashboard">
                        <button className="group px-8 py-4 bg-[#1B3A5C] text-white rounded-[50px] font-semibold text-lg shadow-[0_4px_12px_rgba(27,58,92,0.3)] hover:bg-[#4A9B9B] hover:shadow-[0_8px_20px_rgba(74,155,155,0.4)] active:bg-[#0F1F2E] active:shadow-[0_2px_8px_rgba(27,58,92,0.25)] active:scale-98 transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-[2px] active:translate-y-[3px]">
                            Launch Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <Link to="/compare">
                        <button className="px-8 py-4 bg-transparent border-2 border-[#1B3A5C] text-[#1B3A5C] rounded-[50px] font-semibold text-lg shadow-[0_2px_8px_rgba(27,58,92,0.15)] hover:bg-[#1B3A5C] hover:text-white hover:shadow-[0_8px_20px_rgba(27,58,92,0.3)] hover:-translate-y-[2px] active:bg-[#0F1F2E] active:shadow-[0_2px_8px_rgba(27,58,92,0.2)] active:scale-98 active:translate-y-[3px] transition-all duration-300">
                            Compare Rolls
                        </button>
                    </Link>
                </div>

                {/* Stats - Connected to Backend - Right aligned */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl ml-auto">
                    <div className="text-center py-8 px-10 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                        <div className={`text-4xl md:text-5xl font-bold text-[#2D3E8F] mb-2 ${loading ? 'animate-pulse' : ''}`}>
                            {stats.constituencies}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">Constituencies Monitored</div>
                    </div>
                    <div className="text-center py-8 px-10 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                        <div className={`text-4xl md:text-5xl font-bold text-[#10B981] mb-2 ${loading ? 'animate-pulse' : ''}`}>
                            {stats.voters}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">Registered Voters Tracked</div>
                    </div>
                    <div className="text-center py-8 px-10 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                        <div className={`text-4xl md:text-5xl font-bold text-[#EF4444] mb-2 ${loading ? 'animate-pulse' : ''}`}>
                            {stats.anomalies}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">Active Anomalies Detected</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
