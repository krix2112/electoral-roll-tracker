import { Plus, Trash2, Edit3, Activity } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedMetricCardsProps {
  data: {
    added: any[];
    deleted: any[];
    modified: any[];
  };
  metrics: {
    totalChanges: number;
    additionsCount: number;
    deletionsCount: number;
    modificationsCount: number;
    additionsRatio: string;
    deletionsRatio: string;
    modificationsRatio: string;
  };
}

export function AnimatedMetricCards({ data, metrics }: AnimatedMetricCardsProps) {
  const metricsConfig = [
    {
      icon: Activity,
      label: "Total Changes",
      value: metrics.totalChanges,
      subtitle: "Verified Stream",
      color: "indigo",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: Plus,
      label: "Additions",
      value: metrics.additionsCount,
      subtitle: `${metrics.additionsRatio}% Ratio`,
      color: "emerald",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      gradient: "from-emerald-500 to-teal-600",
      prefix: "+",
    },
    {
      icon: Trash2,
      label: "Unexplained Deletions",
      value: metrics.deletionsCount,
      subtitle: `${metrics.deletionsRatio}% Ratio`,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-100",
      gradient: "from-red-500 to-pink-600",
      prefix: "-",
    },
    {
      icon: Edit3,
      label: "Modifications",
      value: metrics.modificationsCount,
      subtitle: `${metrics.modificationsRatio}% Ratio`,
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      gradient: "from-amber-500 to-orange-600",
      prefix: "~",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {metricsConfig.map((metric, index) => (
        <MetricCard key={index} metric={metric} index={index} />
      ))}
    </div>
  );
}

function MetricCard({ metric, index }: { metric: any; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const Icon = metric.icon;

  // Count-up animation
  useEffect(() => {
    let startTime: number;
    const duration = 1000; // 1 second
    const startValue = 0;
    const endValue = metric.value;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [metric.value]);

  const formattedValue = `${metric.prefix || ""}${displayValue.toLocaleString()}`;


  return (
    <motion.div
      className={`${metric.bgColor} ${metric.borderColor} border rounded-xl p-5 relative overflow-hidden cursor-pointer`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      {isHovered && (
        <>
          <motion.div
            className={`absolute w-2 h-2 ${metric.bgColor} rounded-full`}
            initial={{ x: 10, y: 10, opacity: 0 }}
            animate={{
              x: [10, 50, 80],
              y: [10, 30, 60],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className={`absolute w-1.5 h-1.5 ${metric.bgColor} rounded-full`}
            initial={{ x: 80, y: 20, opacity: 0 }}
            animate={{
              x: [80, 40, 10],
              y: [20, 50, 80],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      <div className="relative z-10">
        <motion.div
          className={`${metric.textColor} mb-3 inline-block`}
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <Icon size={24} />
        </motion.div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-1">
          {metric.label}
        </div>
        <motion.div
          className={`text-3xl font-bold ${metric.textColor} mb-1`}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {formattedValue}
        </motion.div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Activity size={12} />
          <span>{metric.subtitle}</span>
        </div>
      </div>

      {/* Progress bar animation */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
        style={{ color: `var(--${metric.color}-500)` }}
      />
    </motion.div>
  );
}
