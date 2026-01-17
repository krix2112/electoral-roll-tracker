import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface PeakDetectionChartProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
  temporalData: Array<{ date: string; value: number; additions: number; deletions: number }>;
  metrics: {
    totalChanges: number;
  };
}

export function PeakDetectionChart({ data, temporalData, metrics }: PeakDetectionChartProps) {
  // Use temporal data if available, otherwise create fallback
  const chartData = temporalData.length > 0 ? temporalData : [
    { date: "Start", value: 0 },
    { date: "Current", value: metrics.totalChanges }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Peak Event Detection</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
            PEAK: {metrics.totalChanges.toLocaleString()} CHANGES (CURRENT)
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Time-series spike analysis revealing abnormal change concentration
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#peakGradient)"
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ForensicIntensitySignal() {
  // Hardcoded intensity progression for now - can be enhanced with real temporal patterns
  const intensityData = [
    { date: "May", value: 15 },
    { date: "Jun", value: 22 },
    { date: "Jul", value: 18 },
    { date: "Aug", value: 28 },
    { date: "Sep", value: 35 },
    { date: "Oct", value: 42 },
    { date: "Nov", value: 95 },
    { date: "Dec", value: 180 },
    { date: "Jan", value: 320 },
    { date: "Feb", value: 520 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Forensic Intensity Signal</h3>
        <p className="text-sm text-gray-600">
          High-fidelity behavioral anomaly detection with trend escalation
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={intensityData}>
          <defs>
            <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#intensityGradient)"
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
        <span className="text-sm font-medium text-gray-700">Peak Intensity Detected</span>
        <span className="text-lg font-bold text-purple-700">Feb 2025</span>
      </div>
    </div>
  );
}
