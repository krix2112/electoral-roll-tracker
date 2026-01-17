import { Microscope, Target, Scale } from 'lucide-react';

export function SolutionsStack() {
    const solutions = [
        {
            icon: Microscope,
            title: 'Forensics Engine',
            description: 'Advanced analytical capabilities to examine electoral roll data with precision and depth.',
            features: [
                'Deep data mining and pattern recognition',
                'Historical comparison and trend analysis',
                'Statistical anomaly identification',
                'Cross-reference validation across datasets'
            ],
            gradient: 'from-[#2D3E8F] to-[#4A5FB5]'
        },
        {
            icon: Target,
            title: 'Anomaly Detection',
            description: 'Intelligent systems that automatically identify suspicious patterns and irregularities.',
            features: [
                'Real-time monitoring and alerts',
                'Machine learning-based pattern detection',
                'Duplicate and ghost voter identification',
                'Geographic inconsistency flagging'
            ],
            gradient: 'from-[#FF6B4A] to-[#FF8F6B]'
        },
        {
            icon: Scale,
            title: 'Court-Ready Auditing',
            description: 'Comprehensive documentation and reporting systems designed to meet legal standards.',
            features: [
                'Complete audit trail generation',
                'Legally admissible report formatting',
                'Timestamp verification and chain of custody',
                'Expert analysis and summary documentation'
            ],
            gradient: 'from-[#10B981] to-[#34D399]'
        }
    ];

    return (
        <div className="solutions-stack-container">
            <style>{`
        .solutions-stack-container {
          position: relative;
        }
        .solution-card-wrapper {
          position: sticky;
          top: 120px;
        }
        .solution-card-wrapper:nth-child(1) { top: 100px; z-index: 1; }
        .solution-card-wrapper:nth-child(2) { top: 130px; z-index: 2; }
        .solution-card-wrapper:nth-child(3) { top: 160px; z-index: 3; }
        .solution-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .solution-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.25);
        }
      `}</style>

            {solutions.map((solution, index) => (
                <div
                    key={index}
                    className="solution-card-wrapper mb-6"
                >
                    <div className="solution-card">
                        <div className={`bg-gradient-to-r ${solution.gradient} p-6`}>
                            <solution.icon className="w-12 h-12 text-white mb-3" />
                            <h3 className="text-2xl text-white font-bold">{solution.title}</h3>
                        </div>
                        <div className="p-6 bg-white">
                            <p className="text-gray-700 mb-4 leading-relaxed">{solution.description}</p>
                            <ul className="space-y-2">
                                {solution.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                                        <span className="text-[#FF6B4A] font-bold">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}

            {/* Spacer for scroll room */}
            <div style={{ height: '100px' }}></div>
        </div>
    );
}
