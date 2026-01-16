import { MapPin } from "lucide-react";

const heatmapData = [
  { name: "New Delhi", intensity: 45 },
  { name: "Chandni Chowk", intensity: 28 },
  { name: "South Delhi", intensity: 62 },
  { name: "East Delhi", intensity: 38 },
  { name: "West Delhi", intensity: 52 },
  { name: "North Delhi", intensity: 41 },
  { name: "North East Delhi", intensity: 85 },
  { name: "North West Delhi", intensity: 33 },
  { name: "Shahdara", intensity: 48 },
  { name: "South West Delhi", intensity: 55 },
];

export function ConstituencyHeatmap() {
  const maxIntensity = Math.max(...heatmapData.map(d => d.intensity));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Constituency Intensity Map</h3>
        <p className="text-sm text-gray-600">
          Geospatial variance concentration across electoral constituencies
        </p>
      </div>

      <div className="space-y-2">
        {heatmapData.map((item, index) => {
          const intensity = (item.intensity / maxIntensity) * 100;
          const colorClass = 
            intensity > 70 ? "bg-red-500" :
            intensity > 50 ? "bg-orange-500" :
            intensity > 30 ? "bg-yellow-500" :
            "bg-emerald-500";
          
          return (
            <div key={index} className="relative group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.intensity}</span>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full ${colorClass} transition-all duration-500 rounded-full relative`}
                  style={{ width: `${intensity}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Intensity Scale</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-xs text-gray-600">Low</span>
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span className="text-xs text-gray-600">Medium</span>
          <div className="w-4 h-4 rounded bg-orange-500" />
          <span className="text-xs text-gray-600">High</span>
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-xs text-gray-600">Critical</span>
        </div>
      </div>
    </div>
  );
}
