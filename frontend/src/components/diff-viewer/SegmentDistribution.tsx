import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const segmentData = [
  { month: "Jan", additions: 45, modifications: 12, deletions: 28 },
  { month: "Feb", additions: 38, modifications: 8, deletions: 32 },
  { month: "Mar", additions: 52, modifications: 15, deletions: 25 },
  { month: "Apr", additions: 41, modifications: 10, deletions: 30 },
  { month: "May", additions: 48, modifications: 18, deletions: 35 },
  { month: "Jun", additions: 55, modifications: 22, deletions: 40 },
  { month: "Jul", additions: 63, modifications: 28, deletions: 45 },
  { month: "Aug", additions: 72, modifications: 35, deletions: 58 },
  { month: "Sep", additions: 88, modifications: 42, deletions: 75 },
  { month: "Oct", additions: 105, modifications: 48, deletions: 95 },
  { month: "Nov", additions: 142, modifications: 55, deletions: 130 },
  { month: "Dec", additions: 180, modifications: 62, deletions: 175 },
  { month: "Jan '25", additions: 280, modifications: 68, deletions: 285 },
  { month: "Feb '25", additions: 320, modifications: 72, deletions: 360 },
];

export function SegmentDistribution() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Segment Distribution</h3>
        <p className="text-sm text-gray-600">
          Categorical breakdown of record-level variances over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={segmentData}>
          <defs>
            <linearGradient id="additionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
            </linearGradient>
            <linearGradient id="modificationsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4}/>
            </linearGradient>
            <linearGradient id="deletionsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            stroke="#e5e7eb"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="additions" 
            fill="url(#additionsGradient)" 
            radius={[4, 4, 0, 0]}
            name="Additions"
          />
          <Bar 
            dataKey="modifications" 
            fill="url(#modificationsGradient)" 
            radius={[4, 4, 0, 0]}
            name="Modifications"
          />
          <Bar 
            dataKey="deletions" 
            fill="url(#deletionsGradient)" 
            radius={[4, 4, 0, 0]}
            name="Unexplained Deletions"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-700">Additions Trend ↗</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-gray-700">Modifications Stable →</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs font-medium text-gray-700">Deletions Spike ↗↗</span>
        </div>
      </div>
    </div>
  );
}
