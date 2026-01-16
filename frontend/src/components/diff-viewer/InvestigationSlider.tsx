import { AlertTriangle, MapPin, RefreshCw } from "lucide-react";

const investigations = [
  {
    icon: <AlertTriangle size={20} className="text-red-600" />,
    badge: "Cleanup Phase",
    title: "Critical Alert",
    description: "57% of changes are deletions (voter removals).",
    severity: "high",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: <MapPin size={20} className="text-blue-600" />,
    badge: "High Impact Areas",
    title: "Spatial Concentration",
    description: "1 constituencies show abnormal change velocity.",
    severity: "medium",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    icon: <RefreshCw size={20} className="text-purple-600" />,
    badge: "Major Update",
    title: "Pattern Detection",
    description: "High variance detected in 3+ blocks exceeding baseline.",
    severity: "medium",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
];

export function InvestigationSlider() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Investigation Triggers</h3>
          <p className="text-sm text-gray-600">Automated anomaly detection results</p>
        </div>
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
          Filters apply instantly · 1400 records found
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
            style={{ width: '57%' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>Start Date</span>
          <span className="font-medium text-gray-900">Analysis Progress: 57%</span>
          <span>End Date</span>
        </div>
      </div>
    </div>
  );
}
