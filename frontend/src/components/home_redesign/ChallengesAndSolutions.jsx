import { EyeOff, Ghost, AlertTriangle } from 'lucide-react';
import { SolutionsStack } from './SolutionsStack';

export function ChallengesAndSolutions() {
    const challenges = [
        {
            icon: Ghost,
            title: 'Silent Manipulation',
            description: 'Unauthorized changes to electoral rolls often go unnoticed for extended periods, potentially affecting the legitimacy of electoral outcomes.',
            details: [
                'Undetected additions or deletions of voters',
                'Subtle modifications to voter information',
                'Delayed discovery of systematic changes'
            ]
        },
        {
            icon: EyeOff,
            title: 'Invisible Fraud',
            description: 'Traditional manual verification methods struggle to identify sophisticated patterns of electoral fraud that span across multiple constituencies.',
            details: [
                'Complex patterns difficult to spot manually',
                'Cross-constituency manipulation networks',
                'Historical data manipulation techniques'
            ]
        },
        {
            icon: AlertTriangle,
            title: 'Audit Opacity',
            description: 'Current auditing processes lack the transparency and comprehensive documentation needed for effective oversight and legal accountability.',
            details: [
                'Limited visibility into change history',
                'Insufficient documentation for legal proceedings',
                'Lack of standardized audit trails'
            ]
        }
    ];

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Current Challenges - Left Side */}
                    <div>
                        <div className="mb-8">
                            <h2 className="text-4xl text-gray-900 mb-4 font-bold">Current Challenges</h2>
                            <p className="text-gray-600 text-lg">Understanding the problems in electoral roll management</p>
                        </div>

                        <div className="space-y-6">
                            {challenges.map((challenge, index) => (
                                <div key={index} className="bg-white p-6 rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-lg transition-all">
                                    <challenge.icon className="w-10 h-10 text-red-500 mb-3" />
                                    <h3 className="text-xl text-gray-900 mb-2 font-semibold">{challenge.title}</h3>
                                    <p className="text-gray-600 mb-3 leading-relaxed text-sm">{challenge.description}</p>
                                    <ul className="space-y-1.5">
                                        {challenge.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MatSetu's Solutions - Right Side with Sticky Stacking */}
                    <div>
                        <div className="mb-8">
                            <h2 className="text-4xl text-gray-900 mb-4 font-bold">MatSetu's Solutions</h2>
                            <p className="text-gray-600 text-lg">Powerful tools to ensure electoral integrity</p>
                        </div>

                        <SolutionsStack />
                    </div>
                </div>
            </div>
        </section>
    );
}
