import { Search, History, Users, ShieldAlert, Activity, FileSearch, ArrowRight } from 'lucide-react';

export function NewFeatures() {
    const features = [
        {
            icon: Search,
            title: 'Anomaly Detection',
            description: 'AI-powered detection of suspicious voter roll changes across all constituencies.',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-500/10 to-cyan-500/5'
        },
        {
            icon: History,
            title: 'Time Travel Analysis',
            description: 'Visualize voter roll changes over time with interactive timeline slider.',
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-500/10 to-emerald-500/5'
        },
        {
            icon: Users,
            title: 'Real-time Monitoring',
            description: 'Track 450M+ registered voters across all Indian states and territories.',
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/10 to-orange-500/5'
        },
        {
            icon: ShieldAlert,
            title: 'Fraud Prevention',
            description: 'Identify ghost voters, duplicates, and suspicious patterns instantly.',
            gradient: 'from-red-500 to-rose-500',
            bgGradient: 'from-red-500/10 to-rose-500/5'
        },
        {
            icon: Activity,
            title: 'Demographic Analytics',
            description: 'Deep insights into voter demographics, age distribution, and trends.',
            gradient: 'from-purple-500 to-violet-500',
            bgGradient: 'from-purple-500/10 to-violet-500/5'
        },
        {
            icon: FileSearch,
            title: 'Court-Ready Reports',
            description: 'Generate legally admissible audit reports with complete documentation.',
            gradient: 'from-pink-500 to-fuchsia-500',
            bgGradient: 'from-pink-500/10 to-fuchsia-500/5'
        }
    ];

    return (
        <section id="features" className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    {/* Highlighted Features Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-8 shadow-sm">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold tracking-wide">Features</span>
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Powerful Intelligence Tools
                    </h2>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-light">
                        Everything you need to ensure electoral integrity and transparency
                    </p>
                </div>

                {/* Features Grid - Premium Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                        >
                            {/* Gradient top bar */}
                            <div className={`h-1.5 w-full bg-gradient-to-r ${feature.gradient}`} />

                            {/* Background gradient on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="relative p-8">
                                {/* Icon with gradient background */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed mb-4">{feature.description}</p>

                                {/* Learn more link */}
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <span>Learn more</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
