import { AlertTriangle, MapPin, RefreshCw } from "lucide-react";

interface InvestigationSliderProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
  metrics: {
    totalChanges: number;
    deletionsCount: number;
    deletionsRatio: string;
    deletionRatioNumeric: number;
  };
  constituencyStats: Record<string, { added: number; deleted: number; modified: number; total: number }>;
}

export function InvestigationSlider({ data, metrics, constituencyStats }: InvestigationSliderProps) {
  // Calculate high-impact constituencies
  const highImpactConstituencies = Object.entries(constituencyStats)
    .filter(([_, stats]) => stats.total > (metrics.totalChanges / Object.keys(constituencyStats).length) * 1.5)
    .length;

  // Calculate blocks with high variance
  const highVarianceBlocks = Object.entries(constituencyStats)
    .filter(([_, stats]) => {
      const deletionRatio = stats.total > 0 ? stats.deleted / stats.total : 0;
      return deletionRatio > 0.6 || deletionRatio < 0.2;
    })
    .length;

  const investigations = [
    {
      icon: <AlertTriangle size={20} className="text-red-600" />,
      badge: metrics.deletionRatioNumeric > 0.5 ? "Cleanup Phase" : "Growth Phase",
      title: "Critical Alert",
      description: `${metrics.deletionsRatio}% of changes are deletions (voter removals).`,
      severity: metrics.deletionRatioNumeric > 0.5 ? "high" : "medium",
      bgColor: metrics.deletionRatioNumeric > 0.5 ? "bg-red-50" : "bg-emerald-50",
      borderColor: metrics.deletionRatioNumeric > 0.5 ? "border-red-200" : "border-emerald-200",
    },
    {
      icon: <MapPin size={20} className="text-blue-600" />,
      badge: "High Impact Areas",
      title: "Spatial Concentration",
      description: `${highImpactConstituencies} constituencies show abnormal change velocity.`,
      severity: "medium",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      icon: <RefreshCw size={20} className="text-purple-600" />,
      badge: "Major Update",
      title: "Pattern Detection",
      description: `High variance detected in ${highVarianceBlocks}+ blocks exceeding baseline.`,
      severity: "medium",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Investigation Triggers</h3>
          <p className="text-sm text-gray-600">Automated anomaly detection results</p>
        </div>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
          Filters apply instantly · {metrics.totalChanges} records found
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {investigations.map((investigation, index) => (
          <div
            key={index}
            className={`${investigation.bgColor} ${investigation.borderColor} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all group`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${investigation.bgColor} border ${investigation.borderColor}`}>
                {investigation.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  {investigation.badge}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {investigation.title}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {investigation.description}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline indicator */}
      <div className="mt-6 relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-blue-500 to-purple-500 rounded-full"
            style={{ width: `${Math.round(metrics.deletionRatioNumeric * 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Start Date</span>
          <span className="font-medium text-gray-900">Analysis Progress: {metrics.deletionsRatio}%</span>
          <span>End Date</span>
        </div>
      </div>
    </div>
  );
}
