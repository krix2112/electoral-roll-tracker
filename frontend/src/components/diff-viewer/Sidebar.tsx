import { LayoutDashboard, Upload, GitCompare, LineChart, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <div className="w-[220px] h-screen bg-white border-r border-gray-200 flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Logo */}
      <motion.div
        className="p-6 border-b border-gray-200 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
          <div className="flex items-baseline">
            <span className="text-2xl font-['Noto_Serif_Devanagari'] font-semibold text-indigo-600">मत</span>
            <span className="text-2xl font-semibold text-gray-800">Setu</span>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 relative z-10">
        <Link to="/"><NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" delay={0.1} /></Link>
        <Link to="/upload"><NavItem icon={<Upload size={20} />} label="Upload Rolls" delay={0.2} /></Link>
        <Link to="/compare"><NavItem icon={<GitCompare size={20} />} label="Compare Versions" delay={0.3} /></Link>
        <Link to="/diffviewer"><NavItem icon={<LineChart size={20} />} label="Change Analysis" active delay={0.4} /></Link>
      </nav>

      {/* User Profile */}
      <motion.div
        className="p-4 border-t border-gray-200 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <User size={20} className="text-indigo-600" />
          </motion.div>
          <div>
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">ECI Official</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NavItem({ icon, label, active = false, delay = 0 }: { icon: React.ReactNode; label: string; active?: boolean; delay?: number }) {
  return (
    <motion.div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all relative overflow-hidden ${active
        ? "bg-indigo-50 text-indigo-600 font-medium"
        : "text-gray-600 hover:bg-gray-50"
        }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r"
          layoutId="activeIndicator"
        />
      )}
      {icon}
      <span className="text-sm">{label}</span>
    </motion.div>
  );
}
