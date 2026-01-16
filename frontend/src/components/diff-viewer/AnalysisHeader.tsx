import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/diff-viewer/ui/button";
import { motion } from "framer-motion";

export function AnalysisHeader() {
  return (
    <motion.div 
      className="bg-white border-b border-gray-200 px-8 py-5 relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h1 
              className="text-2xl font-bold text-gray-900 mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              MatSetu Forensic Analysis
            </motion.h1>
            <div className="flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FileText size={16} className="text-indigo-600" />
                <span className="text-gray-600">Delhi_Feb2024_5888voters.csv</span>
              </motion.div>
              <div className="w-px h-4 bg-gray-300" />
              <motion.div 
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <FileText size={16} className="text-purple-600" />
                <span className="text-gray-600">Delhi_Feb2025_4888voters.csv</span>
              </motion.div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} />
              Back to Selection
            </Button>
          </motion.div>
        </div>

        {/* Forensic Overview Badge */}
        <motion.div 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-100 cursor-pointer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={16} className="text-indigo-600" />
          </motion.div>
          <span className="text-sm font-medium text-gray-700">Forensic Overview</span>
          <motion.span 
            className="text-xs bg-white px-2 py-0.5 rounded-full text-indigo-600 font-semibold"
            animate={{ boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 6px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Volume = Quantity of Change
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}
