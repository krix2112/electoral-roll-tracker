import { Plus, Trash2, Edit3, AlertCircle } from "lucide-react";

const metrics = [
  {
    icon: <Activity size={20} />,
    label: "Total Changes",
    value: "1,400",
    subtitle: "Verified Stream",
    color: "indigo",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-100",
  },
  {
    icon: <Plus size={20} />,
    label: "Additions",
    value: "+600",
    subtitle: "42.9% Ratio",
    color: "emerald",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
  {
    icon: <Trash2 size={20} />,
    label: "Unexplained Deletions",
    value: "-800",
    subtitle: "57.1% Ratio",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    borderColor: "border-red-100",
  },
  {
    icon: <Edit3 size={20} />,
    label: "Modifications",
    value: "~0",
    subtitle: "0.0% Ratio",
    color: "amber",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-100",
  },
];

import { Activity } from "lucide-react";

export function MetricCards() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.bgColor} ${metric.borderColor} border rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all`}
        >
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-24 h-24 ${metric.textColor} opacity-5 transform translate-x-8 -translate-y-8`}>
            <div className="w-full h-full rounded-full" />
          </div>
          
          <div className="relative">
            <div className={`${metric.textColor} mb-3`}>
              {metric.icon}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
              {metric.label}
            </div>
            <div className={`text-3xl font-bold ${metric.textColor} mb-1`}>
              {metric.value}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Activity size={12} />
              <span>{metric.subtitle}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
