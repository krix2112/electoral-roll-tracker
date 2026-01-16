import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

import { useMemo } from "react";

interface CircularProgressProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
}

export function CircularProgressDashboard({ data }: CircularProgressProps) {
  const metrics = useMemo(() => {
    const total = data.added.length + data.deleted.length + data.modified.length || 1;
    const deletionRatio = (data.deleted.length / total) * 100;

    // Heuristics for demo purposes
    const integrityScore = Math.max(0, Math.min(100, 100 - (deletionRatio * 0.5))).toFixed(0);
    const riskLevel = Math.min(100, Math.max(0, deletionRatio * 1.2)).toFixed(0);
    const anomalyIndex = Math.min(100, (data.modified.length / total) * 500 + 20).toFixed(0); // Arbitrary scale

    return [
      {
        icon: Shield,
        label: "Integrity Score",
        value: parseInt(integrityScore),
        color: "indigo",
        gradient: "from-indigo-500 to-purple-600",
      },
      {
        icon: Activity,
        label: "Anomaly Index",
        value: parseInt(anomalyIndex),
        color: "amber",
        gradient: "from-amber-500 to-orange-600",
      },
      {
        icon: CheckCircle2,
        label: "Verification Rate",
        value: 96, // Mock for now
        color: "emerald",
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        icon: AlertTriangle,
        label: "Risk Level",
        value: parseInt(riskLevel),
        color: "red",
        gradient: "from-red-500 to-pink-600",
      },
    ];
  }, [data]);

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full flex flex-col justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Real-Time Quality Metrics</h3>

      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <CircularProgress key={index} metric={metric} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

function CircularProgress({ metric, index }: { metric: typeof metrics[0]; index: number }) {
  const Icon = metric.icon;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (metric.value / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#f3f4f6"
            strokeWidth="8"
            fill="none"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke={`url(#gradient-${index})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={`text-${metric.color}-500`} style={{ stopColor: 'currentColor' }} />
              <stop offset="100%" className={`text-${metric.color}-600`} style={{ stopColor: 'currentColor' }} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className={`text-${metric.color}-600 mb-1`} size={24} />
          </motion.div>
          <motion.div
            className={`text-2xl font-bold text-${metric.color}-600`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            {metric.value}%
          </motion.div>
        </div>

        {/* Glowing effect */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${metric.gradient} opacity-0 blur-xl`}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
        />
      </div>

      <div className="mt-3 text-center">
        <div className="text-sm font-medium text-gray-900">{metric.label}</div>
        <div className={`text-xs text-${metric.color}-600 font-medium`}>
          {metric.value > 80 ? "Excellent" : metric.value > 60 ? "Good" : metric.value > 40 ? "Fair" : "Needs Attention"}
        </div>
      </div>
    </motion.div>
  );
}
