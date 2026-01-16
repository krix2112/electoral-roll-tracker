import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

const treemapData = [
  {
    name: "Electoral Changes",
    children: [
      { name: "North East Delhi", size: 620, deletions: 310, additions: 280, risk: "high" },
      { name: "South Delhi", size: 450, deletions: 120, additions: 220, risk: "medium" },
      { name: "South West Delhi", size: 420, deletions: 115, additions: 210, risk: "medium" },
      { name: "North West Delhi", size: 380, deletions: 105, additions: 195, risk: "medium" },
      { name: "Chandni Chowk", size: 350, deletions: 82, additions: 150, risk: "medium" },
      { name: "Shahdara", size: 310, deletions: 88, additions: 165, risk: "medium" },
      { name: "East Delhi", size: 280, deletions: 95, additions: 180, risk: "medium" },
      { name: "West Delhi", size: 265, deletions: 72, additions: 145, risk: "low" },
      { name: "New Delhi", size: 240, deletions: 68, additions: 130, risk: "low" },
      { name: "North Delhi", size: 200, deletions: 45, additions: 100, risk: "low" },
    ],
  },
];

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, name, size } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: COLORS[index % COLORS.length],
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.9,
        }}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="600"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={16}
            fontWeight="bold"
          >
            {size}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 24}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            opacity={0.9}
          >
            changes
          </text>
        </>
      )}
    </g>
  );
};

export function ConstituencyTreemap() {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-40" />
      
      <div className="relative z-10">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="text-blue-600" size={20} />
            Hierarchical Volume Distribution
          </h3>
          <p className="text-sm text-gray-600">
            Proportional visualization of change density across constituencies
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
          >
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
                      <p className="text-xs text-gray-600">Total Changes: <span className="font-medium text-indigo-600">{data.size}</span></p>
                      <p className="text-xs text-gray-600">Additions: <span className="font-medium text-emerald-600">+{data.additions}</span></p>
                      <p className="text-xs text-gray-600">Deletions: <span className="font-medium text-red-600">-{data.deletions}</span></p>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          data.risk === 'high' ? 'bg-red-100 text-red-700' :
                          data.risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {data.risk?.toUpperCase()} RISK
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </Treemap>
        </ResponsiveContainer>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Size represents total change volume · Color coding by constituency · Hover for details
          </p>
        </div>
      </div>
    </motion.div>
  );
}
