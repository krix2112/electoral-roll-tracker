import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const radarData = [
  { metric: "Data Integrity", current: 95, baseline: 80 },
  { metric: "Temporal Consistency", current: 88, baseline: 75 },
  { metric: "Spatial Variance", current: 62, baseline: 85 },
  { metric: "Pattern Recognition", current: 91, baseline: 70 },
  { metric: "Anomaly Detection", current: 78, baseline: 65 },
  { metric: "Audit Compliance", current: 96, baseline: 90 },
];

export function ForensicRadarChart() {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Animated background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="text-indigo-600" size={20} />
              Multi-Dimensional Integrity Scan
            </h3>
            <p className="text-sm text-gray-600">6-axis forensic quality assessment</p>
          </div>
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-1.5 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700">VERIFIED</span>
          </motion.div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Radar
              name="Current Snapshot"
              dataKey="current"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.5}
            />
            <Radar
              name="Expected Baseline"
              dataKey="baseline"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-indigo-50 rounded-lg">
            <div className="text-xs text-gray-600">Avg Score</div>
            <div className="text-lg font-bold text-indigo-600">85%</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <div className="text-xs text-gray-600">At Risk</div>
            <div className="text-lg font-bold text-amber-600">1</div>
          </div>
          <div className="text-center p-2 bg-emerald-50 rounded-lg">
            <div className="text-xs text-gray-600">Optimal</div>
            <div className="text-lg font-bold text-emerald-600">5</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
