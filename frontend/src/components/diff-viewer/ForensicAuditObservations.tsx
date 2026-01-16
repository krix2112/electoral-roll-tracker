import { TrendingUp, Trash2, AlertTriangle, ShieldCheck } from "lucide-react";

const observations = [
  {
    icon: <TrendingUp className="text-emerald-600" size={20} />,
    badge: "Growth Pattern",
    title: "Detected 43% expansion via new voter additions.",
    description: "This signifies an upward roll trajectory.",
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    icon: <Trash2 className="text-red-600" size={20} />,
    badge: "Cleanup Audit",
    title: "800 deletions identified.",
    description: "Behavioral pattern aligns with routine maintenance.",
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    icon: <AlertTriangle className="text-amber-600" size={20} />,
    badge: "Spatial Variance",
    title: "High density variance clusters identified.",
    description: "Concentrated updates detected in 3+ blocks exceeding baseline.",
    color: "amber",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    icon: <ShieldCheck className="text-blue-600" size={20} />,
    badge: "Integrity Scoring",
    title: "System Status: HIGH COMPLEXITY.",
    description: "Preliminary forensic checks indicate 100% data integrity for validated blocks.",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

export function ForensicAuditObservations() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Forensic Audit Observations</h3>
          <p className="text-sm text-gray-600">Key findings from automated integrity analysis</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
          REPORT SECURED
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {observations.map((obs, index) => (
          <div
            key={index}
            className={`${obs.bgColor} ${obs.borderColor} border rounded-lg p-5 hover:shadow-md transition-all group cursor-pointer`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2.5 rounded-lg bg-white shadow-sm`}>
                {obs.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  {obs.badge}
                </div>
                <div className="text-sm font-bold text-gray-900 leading-snug">
                  {obs.title}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {obs.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
