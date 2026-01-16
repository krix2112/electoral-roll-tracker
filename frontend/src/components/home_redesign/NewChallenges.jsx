import { AlertTriangle, CheckCircle, Smartphone, EyeOff, FileX, Fingerprint, Shield, TrendingUp } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

export function NewChallenges() {
    const stackContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const problems = [
        {
            icon: EyeOff,
            title: 'Silent Manipulation',
            description: 'Voter roll data is changed without trace, hiding fraud in silent, time-based edits rather than static lists.'
        },
        {
            icon: TrendingUp,
            title: 'Statistically Invisible Fraud',
            description: 'Abnormal patterns of mass deletions, insertions, or changes are undetectable in traditional audits.'
        },
        {
            icon: FileX,
            title: 'Audit Opacity & Distrust',
            description: 'Lack of transparent change history prevents independent verification and erodes trust in electoral integrity.'
        }
    ];

    const solutions = [
        {
            icon: Fingerprint,
            title: 'Electoral Roll Forensics Engine',
            description: 'Our system continuously tracks and time-stamps roll changes, enabling the replay of any voter list modification.',
            color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            barColor: 'bg-blue-500'
        },
        {
            icon: AlertTriangle,
            title: 'Automated Anomaly Detection',
            description: 'Statistical algorithms flag suspicious changes, uncovering hidden patterns of mass or coordinated manipulation.',
            color: 'bg-gradient-to-br from-orange-500 to-orange-600',
            barColor: 'bg-orange-500'
        },
        {
            icon: Shield,
            title: 'Transparent, Court-Ready Auditing',
            description: 'Generates verifiable, time-stamped reports for transparent oversight and legally admissible evidence.',
            color: 'bg-gradient-to-br from-green-500 to-green-600',
            barColor: 'bg-green-500'
        },
        {
            icon: CheckCircle,
            title: 'Real-time Alerts',
            description: 'Get notified immediately when suspicious activities or large-scale changes occur in sensitive constituencies.',
            color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            barColor: 'bg-purple-500'
        },
        {
            icon: TrendingUp,
            title: 'Predictive Analytics',
            description: 'Use historical data trends to predict and prevent potential fraud before it impacts the election outcome.',
            color: 'bg-gradient-to-br from-pink-500 to-pink-600',
            barColor: 'bg-pink-500'
        }
    ];

    // Handle scroll to show cards one by one
    useEffect(() => {
        const container = stackContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const cardHeight = 80; // Height per card step
            const newIndex = Math.min(Math.floor(scrollTop / cardHeight), solutions.length - 1);
            setActiveIndex(newIndex);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [solutions.length]);

    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Why MatSetu?</h2>
                    <p className="text-gray-500 text-lg">Bridging the gap between data opacity and electoral transparency.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Problems Column - STATIC */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Current Problems</h3>
                        </div>

                        {/* Static Cards */}
                        <div className="space-y-4">
                            {problems.map((item, index) => (
                                <div key={index} className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="mt-1 flex-shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                                            <item.icon className="w-6 h-6 text-red-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Solutions Column - STACKED CARDS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">MatSetu's Solutions</h3>
                        </div>

                        {/* Stacked Cards Container */}
                        <div className="h-[550px] rounded-3xl bg-gray-900 relative w-full overflow-hidden">
                            {/* Scroll container */}
                            <div
                                ref={stackContainerRef}
                                className="absolute inset-0 overflow-y-auto scrollbar-hide"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {/* Spacer for scroll */}
                                <div style={{ height: `${solutions.length * 80 + 400}px` }} />
                            </div>

                            {/* Cards stack - fixed position within container */}
                            <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 px-6 pointer-events-none">
                                {/* Stacked card bars showing at top */}
                                <div className="relative w-full" style={{ height: '450px' }}>
                                    {solutions.map((item, index) => {
                                        const isActive = index === activeIndex;
                                        const isPast = index < activeIndex;
                                        const isFuture = index > activeIndex;

                                        // Calculate positions - cards stack from top
                                        const stackOffset = isPast ? 0 : (index - activeIndex) * 12;
                                        const scale = isPast ? 0.9 : 1 - (index - activeIndex) * 0.02;
                                        const opacity = isPast ? 0 : 1;
                                        const zIndex = solutions.length - index;

                                        return (
                                            <div
                                                key={index}
                                                className="absolute left-0 right-0 transition-all duration-500 ease-out"
                                                style={{
                                                    top: `${stackOffset}px`,
                                                    transform: `scale(${scale})`,
                                                    opacity: opacity,
                                                    zIndex: zIndex,
                                                    transformOrigin: 'top center'
                                                }}
                                            >
                                                {/* Card */}
                                                <div className={`${item.color} p-8 rounded-2xl shadow-2xl min-h-[220px] flex flex-col justify-between w-full relative overflow-hidden`}>
                                                    <div className="flex justify-between items-start gap-4 relative z-10">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-2xl font-bold text-white mb-3">{item.title}</h4>
                                                            <p className="text-white/80 leading-relaxed text-base">{item.description}</p>
                                                        </div>
                                                        <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                                            <item.icon className="w-8 h-8 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Scroll indicator */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm flex flex-col items-center gap-2">
                                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                                    <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce" />
                                </div>
                                <span>Scroll to explore</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
