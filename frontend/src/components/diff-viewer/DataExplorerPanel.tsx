import { motion } from "framer-motion";
import { Database, Search, Filter, Download, Eye, TrendingUp } from "lucide-react";
import { useState } from "react";

interface DataExplorerPanelProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
}

export function DataExplorerPanel({ data }: DataExplorerPanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  const dataCategories = [
    { name: "Additions", count: data.added.length, change: "+12.5%", trend: "up", color: "emerald" },
    { name: "Deletions", count: data.deleted.length, change: "+28.3%", trend: "up", color: "red" },
    { name: "Modifications", count: data.modified.length, change: "0.0%", trend: "neutral", color: "amber" },
    { name: "Verified", count: 1200, change: "+15.2%", trend: "up", color: "blue" },
  ];

  const totalProcessing = data.added.length + data.deleted.length + data.modified.length;

  // Placeholder for future functionality
  // const handleAction = (action: string) => {
  //   console.log(`${action} functionality initiated`);
  // };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-orange-50 to-blue-100/50 rounded-xl shadow-lg border border-blue-200/50 p-6 relative overflow-hidden"
      initial={{ opacity: 0, rotateX: 15 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 0.7 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(45, 62, 143, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 62, 143, 0.15) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-orange-200/30 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-orange-200/30 to-blue-200/30 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Database className="text-white" size={24} />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Data Intelligence Explorer</h3>
              <p className="text-sm text-gray-600">Advanced forensic data mining interface</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className="p-2 bg-gray-100 rounded-lg border border-gray-300 opacity-50 cursor-not-allowed"
              title="Search functionality coming soon"
            >
              <Search className="text-gray-400" size={18} />
            </motion.button>
            <motion.button
              className="p-2 bg-gray-100 rounded-lg border border-gray-300 opacity-50 cursor-not-allowed"
              title="Filter functionality coming soon"
            >
              <Filter className="text-gray-400" size={18} />
            </motion.button>
            <motion.button
              className="p-2 bg-gray-100 rounded-lg border border-gray-300 opacity-50 cursor-not-allowed"
              title="Download functionality coming soon"
            >
              <Download className="text-gray-400" size={18} />
            </motion.button>
          </div>
        </div>

        {/* Data Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {dataCategories.map((category, index) => (
            <motion.div
              key={index}
              className="bg-white/60 backdrop-blur-md rounded-lg p-4 border border-blue-200/50 cursor-pointer relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              onClick={() => setActiveTab(index)}
            >
              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <Eye className={`text-${category.color}-400`} size={20} />
                  {category.trend === "up" && (
                    <motion.div
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingUp className="text-emerald-400" size={16} />
                    </motion.div>
                  )}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {category.count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700 mb-2">{category.name}</div>
                <div className={`text-xs font-medium text-${category.color}-400`}>
                  {category.change}
                </div>
              </div>

              {/* Active indicator */}
              {activeTab === index && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-orange-500"
                  layoutId="activeIndicator"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats bars */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-900 mb-2">Active Data Streams</div>
          {[
            { label: "Live Monitoring", percentage: 95, color: "emerald" },
            { label: "Historical Analysis", percentage: 78, color: "blue" },
            { label: "Predictive Models", percentage: 62, color: "purple" },
            { label: "Anomaly Detection", percentage: 88, color: "red" },
          ].map((stream, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{stream.label}</span>
                <span className={`text-${stream.color}-600 font-bold`}>{stream.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r from-${stream.color}-500 to-${stream.color}-400`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stream.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <motion.div
          className="mt-6 pt-4 border-t border-gray-300 flex items-center justify-between text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-gray-700">
            <span className="font-medium">Processing: </span>
            <motion.span
              className="text-emerald-600"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {totalProcessing.toLocaleString()} records
            </motion.span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-gray-700">System Operational</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
