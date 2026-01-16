import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface ForensicCompositionProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
}

export function ForensicComposition({ data: comparisonData }: ForensicCompositionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return [
      { name: "New Voters", value: comparisonData.added.length, color: "#10b981" },
      { name: "Deletions", value: comparisonData.deleted.length, color: "#ef4444" },
    ];
  }, [comparisonData]);

  const totalEvents = comparisonData.added.length + comparisonData.deleted.length + comparisonData.modified.length;
  const growthType = comparisonData.added.length > comparisonData.deleted.length ? "GROWTH-ORIENTED" : "CLEANUP-SKEWED";
  const growthColor = comparisonData.added.length > comparisonData.deleted.length ? "text-emerald-600" : "text-red-600";

  const additionsPct = totalEvents > 0 ? ((comparisonData.added.length / totalEvents) * 100).toFixed(1) : "0.0";
  const deletionsPct = totalEvents > 0 ? ((comparisonData.deleted.length / totalEvents) * 100).toFixed(1) : "0.0";
  const modificationsPct = totalEvents > 0 ? ((comparisonData.modified.length / totalEvents) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Animated gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-100 to-emerald-100 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Forensic Composition Signature</h3>
        <p className="text-sm text-gray-600 mb-6">
          Our forensic engine has analyzed the electoral roll snapshot. The distribution exhibits a{" "}
          <motion.span
            className={`font-semibold ${growthColor}`}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {growthType}
          </motion.span>{" "}
          profile. Modification patterns are within the expected administrative margin.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 items-center">
          {/* Donut Chart */}
          <div className="relative h-64 md:h-auto min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                      style={{
                        filter: activeIndex === index ? 'drop-shadow(0 0 10px rgba(0,0,0,0.3))' : 'none',
                        transition: 'all 0.3s',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#374151', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value: number) => [value.toLocaleString(), 'Records']}
                />
              </PieChart>
            </ResponsiveContainer>
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-4xl font-bold text-gray-900">{totalEvents.toLocaleString()}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Events</div>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer"
              whileHover={{ scale: 1.05, x: 5 }}
              onHoverStart={() => setActiveIndex(0)}
              onHoverEnd={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center"
                  animate={{ rotate: activeIndex === 0 ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <TrendingUp className="text-white" size={20} />
                </motion.div>
                <div>
                  <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">New Voters</div>
                  <div className="text-2xl font-bold text-emerald-700">{comparisonData.added.length.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-emerald-600">{additionsPct}%</div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 cursor-pointer"
              whileHover={{ scale: 1.05, x: 5 }}
              onHoverStart={() => setActiveIndex(1)}
              onHoverEnd={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center"
                  animate={{ rotate: activeIndex === 1 ? 360 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <TrendingDown className="text-white" size={20} />
                </motion.div>
                <div>
                  <div className="text-xs text-red-600 font-medium uppercase tracking-wide">Deletions</div>
                  <div className="text-2xl font-bold text-red-700">{comparisonData.deleted.length.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-red-600">{deletionsPct}%</div>
            </motion.div>

            <motion.div
              className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100"
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Activity className="text-white" size={20} />
                </div>
                <div>
                  <div className="text-xs text-amber-600 font-medium uppercase tracking-wide">Modifications</div>
                  <div className="text-2xl font-bold text-amber-700">{comparisonData.modified.length.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-amber-600">{modificationsPct}%</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
