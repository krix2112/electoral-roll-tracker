import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, ZoomIn, RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

/**
 * ForensicNetworkGraph
 * Visualizes voter relationships to highlight anomalies like "Star Clusters" and "Island Nodes"
 */
export function ForensicNetworkGraph({ anomalyType = 'all' }) {
    const [nodes, setNodes] = useState([])
    const [selectedNode, setSelectedNode] = useState(null)
    const [viewMode, setViewMode] = useState('simulation') // 'simulation' or 'grid'

    // Generate simulation data based on the anomaly type
    useEffect(() => {
        const newNodes = generateNetworkData(anomalyType)
        setNodes(newNodes)
    }, [anomalyType])

    const handleRefresh = () => {
        setNodes(generateNetworkData(anomalyType))
        setSelectedNode(null)
    }

    return (
        <Card className="h-[400px] w-full bg-slate-900 border-slate-800 relative overflow-hidden flex flex-col">
            {/* Header / Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 backdrop-blur-sm">
                    {anomalyType === 'star_cluster' ? '🔴 Star Cluster Detection' :
                        anomalyType === 'island_nodes' ? '🏝️ Island Node Detection' : '🕸️ Live Network Sample'}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Visualization Area */}
            <div className="flex-1 relative cursor-crosshair">
                <svg className="w-full h-full" viewBox="0 0 800 400">
                    <defs>
                        <radialGradient id="starGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Render Links */}
                    {nodes.map(node => (
                        node.children && node.children.map((child, i) => (
                            <motion.line
                                key={`link-${node.id}-${i}`}
                                x1={node.x}
                                y1={node.y}
                                x2={child.x}
                                y2={child.y}
                                stroke={node.type === 'star' ? '#ef4444' : '#64748b'}
                                strokeWidth={node.type === 'star' ? 1.5 : 1}
                                strokeOpacity={0.3}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.3 }}
                                transition={{ duration: 1, delay: i * 0.05 }}
                            />
                        ))
                    ))}

                    {/* Render Nodes */}
                    <AnimatePresence>
                        {nodes.map((node) => (
                            <g key={node.id} onClick={() => setSelectedNode(node)}>
                                {/* Central Hubs */}
                                <motion.circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={node.size}
                                    fill={node.color}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        r: selectedNode?.id === node.id ? node.size * 1.5 : node.size
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 10
                                    }}
                                    className="cursor-pointer hover:opacity-80"
                                />

                                {/* Anomaly Pulse Effect for Star Clusters */}
                                {node.type === 'star' && (
                                    <motion.circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={node.size * 3}
                                        fill="url(#starGradient)"
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}

                                {/* Child Nodes */}
                                {node.children && node.children.map((child, i) => (
                                    <motion.circle
                                        key={`child-${node.id}-${i}`}
                                        cx={child.x}
                                        cy={child.y}
                                        r={3}
                                        fill={node.type === 'star' ? '#fca5a5' : '#94a3b8'}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + (i * 0.02) }}
                                    />
                                ))}

                                {/* Label for main nodes */}
                                {node.label && (
                                    <text
                                        x={node.x}
                                        y={node.y + node.size + 15}
                                        textAnchor="middle"
                                        fill="#94a3b8"
                                        fontSize="10"
                                        className="pointer-events-none select-none"
                                    >
                                        {node.label}
                                    </text>
                                )}
                            </g>
                        ))}
                    </AnimatePresence>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                        <span>Star Cluster (Anomaly)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                        <span>Normal Family</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-slate-500 bg-slate-800"></div>
                        <span>Isolated Node</span>
                    </div>
                </div>
            </div>

            {/* Selection Popup */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-lg w-64 text-white shadow-xl"
                    >
                        <h4 className="font-medium text-sm text-indigo-200 mb-1">{selectedNode.title}</h4>
                        <div className="space-y-1 text-xs text-slate-300">
                            <div className="flex justify-between">
                                <span>Risk Score:</span>
                                <span className={selectedNode.risk > 70 ? "text-red-400 font-bold" : "text-emerald-400"}>
                                    {selectedNode.risk}/100
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Connections:</span>
                                <span>{selectedNode.connections}</span>
                            </div>
                            <p className="border-t border-white/10 pt-1 mt-1 opacity-80 italic">
                                "{selectedNode.evidence}"
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-white"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}

// --- Mock Data Generators ---

function generateNetworkData(type) {
    const width = 800
    const height = 400
    const nodes = []

    // 1. ANOMALY: STAR CLUSTER (The focus)
    if (type === 'all' || type === 'star_cluster') {
        const cx = type === 'star_cluster' ? width / 2 : width * 0.75
        const cy = type === 'star_cluster' ? height / 2 : height * 0.4
        const count = 35 // Unrealistic number of people at one address
        const radius = 80

        const children = []
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            // Add some jitter for realism
            const r = radius + (Math.random() * 20 - 10)
            children.push({
                x: cx + Math.cos(angle) * r,
                y: cy + Math.sin(angle) * r
            })
        }

        nodes.push({
            id: 'star-1',
            type: 'star',
            x: cx,
            y: cy,
            size: 12,
            color: '#ef4444',
            label: '123 Suspicious Apt',
            title: 'High-Density Anomaly',
            risk: 98,
            connections: count,
            evidence: `Unrealistic density: ${count} voters registered at single residential unit.`,
            children
        })
    }

    // 2. NORMAL: FAMILY CLUSTERS
    const numFamilies = type === 'island_nodes' ? 2 : 5
    for (let i = 0; i < numFamilies; i++) {
        const cx = Math.random() * (width - 100) + 50
        const cy = Math.random() * (height - 100) + 50
        // Ensure we don't overlap too much with the star cluster
        if (type !== 'island_nodes' && cx > width * 0.6 && cy < height * 0.6) continue

        const count = Math.floor(Math.random() * 4) + 2 // 2-5 family members
        const radius = 30
        const children = []
        for (let j = 0; j < count; j++) {
            const angle = (j / count) * Math.PI * 2
            children.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            })
        }

        nodes.push({
            id: `fam-${i}`,
            type: 'family',
            x: cx,
            y: cy,
            size: 6,
            color: '#6366f1', // Indigo
            label: '',
            title: 'Normal Household',
            risk: 12,
            connections: count,
            evidence: 'Normal family unit structure detected.',
            children
        })
    }

    // 3. ANOMALY: ISLAND NODES
    if (type === 'all' || type === 'island_nodes') {
        const numIslands = type === 'island_nodes' ? 30 : 15
        for (let i = 0; i < numIslands; i++) {
            const cx = Math.random() * width
            const cy = Math.random() * height

            // Avoid drawing islands inside the star cluster area
            // Simple distance check
            if (nodes[0] && Math.hypot(cx - nodes[0].x, cy - nodes[0].y) < 120) continue;

            nodes.push({
                id: `island-${i}`,
                type: 'island',
                x: cx,
                y: cy,
                size: 3,
                color: '#64748b', // Slate
                label: '',
                title: 'Isolated Voter',
                risk: 65,
                connections: 0,
                evidence: 'Zero familial or residential connections found in roll history.',
                children: [] // No connections
            })
        }
    }

    return nodes
}
