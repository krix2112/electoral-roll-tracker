import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const scatterData = [
  { x: 100, y: 45, z: 200, constituency: "New Delhi", risk: "low" },
  { x: 150, y: 82, z: 350, constituency: "Chandni Chowk", risk: "medium" },
  { x: 220, y: 120, z: 450, constituency: "South Delhi", risk: "medium" },
  { x: 180, y: 95, z: 280, constituency: "East Delhi", risk: "medium" },
  { x: 280, y: 310, z: 620, constituency: "North East Delhi", risk: "high" },
  { x: 130, y: 68, z: 240, constituency: "West Delhi", risk: "low" },
  { x: 165, y: 88, z: 310, constituency: "North Delhi", risk: "medium" },
  { x: 195, y: 105, z: 380, constituency: "North West Delhi", risk: "medium" },
  { x: 145, y: 72, z: 265, constituency: "Shahdara", risk: "low" },
  { x: 210, y: 115, z: 420, constituency: "South West Delhi", risk: "medium" },
];

const COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
};

export function VolumeRiskScatter() {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />
      
      <div className="relative z-10">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} />
            Volume-Risk Distribution Matrix
          </h3>
          <p className="text-sm text-gray-600">
            Correlation between addition volume and deletion intensity
          </p>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Additions" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#e5e7eb"
              label={{ value: 'New Voter Additions', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Deletions"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#e5e7eb"
              label={{ value: 'Voter Deletions', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#6b7280' }}
            />
            <ZAxis type="number" dataKey="z" range={[100, 1000]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">{data.constituency}</p>
                      <p className="text-xs text-gray-600">Additions: <span className="font-medium text-emerald-600">{data.x}</span></p>
                      <p className="text-xs text-gray-600">Deletions: <span className="font-medium text-red-600">{data.y}</span></p>
                      <p className="text-xs text-gray-600">Total Volume: <span className="font-medium text-indigo-600">{data.z}</span></p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          data.risk === 'high' ? 'bg-red-100 text-red-700' :
                          data.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {data.risk.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Constituencies" data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.risk as keyof typeof COLORS]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-600">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">High Risk</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
