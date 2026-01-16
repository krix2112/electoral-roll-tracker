import { motion } from "framer-motion";
import { AlertTriangle, Activity, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function LiveAnomalyDetector() {
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-xl shadow-lg border-2 border-red-200 p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated warning stripes */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.3) 10px, rgba(239, 68, 68, 0.3) 20px)",
        }}
        animate={{ x: [0, 20] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center relative"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(239, 68, 68, 0.7)",
                  "0 0 0 20px rgba(239, 68, 68, 0)",
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle className="text-white" size={24} />
              
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500"
                animate={{ 
                  scale: [1, 2, 2],
                  opacity: [1, 0.5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-500"
                animate={{ 
                  scale: [1, 2, 2],
                  opacity: [1, 0.5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            <div>
              <h3 className="text-lg font-bold text-red-900">LIVE ANOMALY DETECTED</h3>
              <p className="text-sm text-red-700">Real-time forensic monitoring active</p>
            </div>
          </div>

          <motion.div
            className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-600">ACTIVE</span>
          </motion.div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <motion.div
            className="bg-white rounded-lg p-4 border-l-4 border-red-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, x: 5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-red-600" size={16} />
              <span className="text-xs font-semibold text-gray-600 uppercase">Critical Spike</span>
            </div>
            <div className="text-2xl font-bold text-red-600">350</div>
            <div className="text-xs text-gray-600">Changes on Feb 1</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-4 border-l-4 border-orange-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, x: 5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-orange-600" size={16} />
              <span className="text-xs font-semibold text-gray-600 uppercase">Variance Rate</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">573%</div>
            <div className="text-xs text-gray-600">Above baseline</div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-4 border-l-4 border-amber-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, x: 5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-600" size={16} />
              <span className="text-xs font-semibold text-gray-600 uppercase">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">8.7/10</div>
            <div className="text-xs text-gray-600">High severity</div>
          </motion.div>
        </div>

        {/* Live feed simulation */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 uppercase">Detection Feed</span>
            <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="space-y-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={`${pulseCount}-${index}`}
                className="flex items-center gap-3 p-2 bg-white rounded border border-red-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-900">
                    Unusual deletion cluster detected
                  </div>
                  <div className="text-xs text-gray-500">
                    North East Delhi · Severity: High
                  </div>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  {new Date(Date.now() - index * 1000).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Warning footer */}
        <motion.div
          className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3 text-center"
          animate={{ backgroundColor: ["#fee2e2", "#fef2f2", "#fee2e2"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-sm font-semibold text-red-800">
            ⚠️ IMMEDIATE INVESTIGATION RECOMMENDED
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
