import { Search, History, Users, ShieldAlert } from 'lucide-react';

export function FeaturesStats() {
    const features = [
        {
            icon: Search,
            title: 'Anomaly Detection',
            description: 'AI-powered detection of suspicious voter roll changes across 543 constituencies',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            icon: History,
            title: 'Time Travel Analysis',
            description: 'Visualize voter roll changes over time with interactive timeline slider',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50'
        },
        {
            icon: Users,
            title: 'Real-time Monitoring',
            description: 'Track 450M+ registered voters across all Indian states and union territories',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50'
        },
        {
            icon: ShieldAlert,
            title: 'Audit Reports',
            description: 'Generate comprehensive audit reports with charts, maps, and actionable insights',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50'
        }
    ];

    const stats = [
        {
            value: '543',
            label: 'Constituencies Monitored',
            color: 'text-[#4F46E5]'
        },
        {
            value: '450M+',
            label: 'Registered Voters Tracked',
            color: 'text-[#10B981]'
        },
        {
            value: '23',
            label: 'Active Anomalies Detected',
            color: 'text-[#EF4444]'
        }
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <h3 className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</h3>
                            <p className="text-gray-500 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
