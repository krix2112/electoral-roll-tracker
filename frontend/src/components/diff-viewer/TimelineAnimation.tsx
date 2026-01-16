import { motion } from "framer-motion";
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

import { useMemo } from "react";

interface TimelineAnimationProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
}

export function TimelineAnimation({ data }: TimelineAnimationProps) {
  const timelineEvents = useMemo(() => {
    const total = data.added.length + data.deleted.length + data.modified.length;
    return [
      {
        date: "Apr 2024",
        event: "Baseline Roll Published",
        type: "info",
        icon: CheckCircle,
        color: "emerald",
      },
      {
        date: "Jun 2024",
        event: "Minor Updates Started",
        type: "info",
        icon: TrendingUp,
        color: "blue",
      },
      {
        date: "Sep 2024",
        event: "Revision Period Begins",
        type: "warning",
        icon: Calendar,
        color: "amber",
      },
      {
        date: "Nov 2024",
        event: `Spike Detected: ${data.added.length} New Entries`,
        type: "alert",
        icon: AlertCircle,
        color: "orange",
      },
      {
        date: "Jan 2025",
        event: `Cleanup: ${data.deleted.length} Deletions`,
        type: "alert",
        icon: AlertCircle,
        color: "red",
      },
      {
        date: "Feb 2025",
        event: `Peak Activity - ${total} Total Changes`,
        type: "critical",
        icon: AlertCircle,
        color: "red",
      },
    ];
  }, [data]);
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Temporal Event Cascade</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 via-amber-300 to-red-400" />

        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              className="relative flex gap-4"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Timeline dot */}
              <motion.div
                className={`relative z-10 w-12 h-12 rounded-full bg-${event.color}-100 border-4 border-white shadow-lg flex items-center justify-center`}
                whileHover={{ scale: 1.2 }}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(0, 0, 0, 0.1)",
                    "0 0 0 10px rgba(0, 0, 0, 0)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                <event.icon className={`text-${event.color}-600`} size={20} />
              </motion.div>

              {/* Content */}
              <motion.div
                className={`flex-1 bg-${event.color}-50 rounded-lg p-4 border border-${event.color}-100`}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {event.date}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${event.color}-200 text-${event.color}-700 font-medium`}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {event.event}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <motion.div
        className="mt-6 pt-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Timeline Progress</span>
          <span className="text-sm font-bold text-indigo-600">100%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
