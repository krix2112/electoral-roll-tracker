/**
 * ModuleBreakdownPanel - Detection Module Breakdown
 * Network Analysis + Entropy Analysis side by side (row 1)
 * Behavioral Fingerprinting full-width with sub-cards (row 2)
 */

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import '../styles/moduleBreakdown.css'

// Color themes matching ForensicEvidenceCards
const MODULE_THEMES = {
    'Network Analysis': {
        border: '#378A98',
        bg: '#eef8f9',
        hoverBg: '#e3f2f4',
        progressBar: '#378A98',
        shadow: 'rgba(55, 138, 152, 0.18)',
        scoreBg: '#eef8f9',
        scoreColor: '#378A98',
        scoreBorder: '#378A9840',
    },
    'Entropy Analysis': {
        border: '#2D2D2D',
        bg: '#f5f5f5',
        hoverBg: '#ececec',
        progressBar: '#3a3a3a',
        shadow: 'rgba(45, 45, 45, 0.16)',
        scoreBg: '#f0f0f0',
        scoreColor: '#2D2D2D',
        scoreBorder: '#2D2D2D30',
    },
    'Behavioral Fingerprinting': {
        border: '#DEA843',
        bg: '#fdf8ef',
        hoverBg: '#faf2e3',
        progressBar: '#DEA843',
        shadow: 'rgba(222, 168, 67, 0.18)',
        scoreBg: '#fdf8ef',
        scoreColor: '#DEA843',
        scoreBorder: '#DEA84340',
    },
}

const DEFAULT_THEME = {
    border: '#0B1E3B',
    bg: '#f5f7fb',
    hoverBg: '#edf1f8',
    progressBar: '#0B1E3B',
    shadow: 'rgba(11, 30, 59, 0.18)',
    scoreBg: '#f0f4f8',
    scoreColor: '#0B1E3B',
    scoreBorder: '#0B1E3B30',
}

// Sub-card data for Behavioral Fingerprinting
const BEHAVIORAL_SUBCARDS = [
    {
        label: 'Registration Velocity',
        value: '156/day',
        severity: 'CRITICAL',
        severityColor: '#c53030',
    },
    {
        label: 'Form Submission Patterns',
        value: 'Identical',
        severity: 'CRITICAL',
        severityColor: '#c53030',
    },
    {
        label: 'Document Similarity Score',
        value: '94%',
        severity: 'HIGH',
        severityColor: '#DEA843',
    },
    {
        label: 'Timestamp Clustering',
        value: '89% within 2hr',
        severity: 'HIGH',
        severityColor: '#DEA843',
    },
]

// Strip emojis
const stripEmojis = (text) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim()
}

export function ModuleBreakdownPanel({ modules, className = '' }) {
    if (!modules || modules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No module data available
            </div>
        )
    }

    const getTheme = (moduleName) => MODULE_THEMES[moduleName] || DEFAULT_THEME

    // Separate modules: top row (Network + Entropy) and bottom (Behavioral)
    const topModules = modules.filter(m => m.module !== 'Behavioral Fingerprinting')
    const behavioralModule = modules.find(m => m.module === 'Behavioral Fingerprinting')

    return (
        <div className={`module-breakdown-container ${className}`}>
            {/* Section Header */}
            <div className="module-breakdown-header">
                <Info style={{ width: 20, height: 20, color: '#378A98' }} />
                <h3 className="module-breakdown-heading">Detection Module Breakdown</h3>
            </div>

            {/* Top Row: Network Analysis + Entropy Analysis side by side */}
            <div className="module-breakdown-top-row">
                {topModules.map((module, index) => {
                    const theme = getTheme(module.module)
                    return (
                        <ModuleCard
                            key={module.module}
                            module={module}
                            theme={theme}
                            index={index}
                        />
                    )
                })}
            </div>

            {/* Bottom Row: Behavioral Fingerprinting full-width with sub-cards */}
            {behavioralModule && (
                <BehavioralCard
                    module={behavioralModule}
                    theme={getTheme('Behavioral Fingerprinting')}
                    index={topModules.length}
                />
            )}
        </div>
    )
}

/* ============================================
   ModuleCard — Used for Network & Entropy
   ============================================ */
function ModuleCard({ module, theme, index }) {
    const evidenceText = module.evidence && module.evidence.length > 0
        ? stripEmojis(module.evidence[0].replace(/\*\*/g, ''))
        : ''

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.25 } }}
            className="module-card-wrapper"
        >
            <div
                className="module-card"
                style={{
                    borderTop: `4px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                }}
            >
                {/* Top section: title + score */}
                <div className="module-card-top">
                    <div>
                        <h4 className="module-card-title">{module.module}</h4>
                        <span className="module-card-weight">
                            Weight: {(module.weight * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="module-card-score-area">
                        <div className="module-card-contribution">
                            <span className="module-card-contrib-label">Contribution</span>
                            <span className="module-card-contrib-value">{module.contribution?.toFixed(1) || 0}</span>
                        </div>
                        <div
                            className="module-card-score-badge"
                            style={{
                                backgroundColor: theme.scoreBg,
                                color: theme.scoreColor,
                                border: `2px solid ${theme.scoreBorder}`,
                            }}
                        >
                            {Math.round(module.score)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="module-card-progress-section">
                    <div className="module-card-progress-labels">
                        <span>Module Score</span>
                    </div>
                    <div className="module-card-progress-track">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${module.score}%` }}
                            transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                            className="module-card-progress-fill"
                            style={{ backgroundColor: theme.progressBar }}
                        />
                    </div>
                </div>

                {/* Evidence text */}
                {evidenceText && (
                    <p className="module-card-evidence">{evidenceText}</p>
                )}
            </div>

            {/* Hover shadow */}
            <div
                className="module-card-shadow"
                style={{
                    background: `radial-gradient(ellipse at center, ${theme.shadow} 0%, transparent 70%)`,
                }}
            />
        </motion.div>
    )
}

/* ============================================
   BehavioralCard — Full-width with sub-cards
   ============================================ */
function BehavioralCard({ module, theme, index }) {
    const evidenceText = module.evidence && module.evidence.length > 0
        ? stripEmojis(module.evidence[0].replace(/\*\*/g, ''))
        : 'Behavioral patterns indicate automated or coordinated registration processes'

    // Sub-card color alternation using the palette
    const subCardThemes = [
        { bg: '#fdf8ef', border: '#DEA843', valueColor: '#c53030' },     // saffron dark border
        { bg: '#eef8f9', border: '#378A98', valueColor: '#c53030' },     // teal dark border
        { bg: '#f5f5f5', border: '#2D2D2D', valueColor: '#DEA843' },     // grey-black dark border
        { bg: '#f5f7fb', border: '#0B1E3B', valueColor: '#DEA843' },     // navy dark border
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.25 } }}
            className="module-card-wrapper behavioral-full-width"
        >
            <div
                className="module-card behavioral-card"
                style={{
                    borderTop: `4px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                }}
            >
                {/* Top section: title + score */}
                <div className="module-card-top">
                    <div>
                        <h4 className="module-card-title">{module.module}</h4>
                        <span className="module-card-weight">
                            Weight: {(module.weight * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="module-card-score-area">
                        <div className="module-card-contribution">
                            <span className="module-card-contrib-label">Contribution</span>
                            <span className="module-card-contrib-value">{module.contribution?.toFixed(1) || 0}</span>
                        </div>
                        <div
                            className="module-card-score-badge"
                            style={{
                                backgroundColor: theme.scoreBg,
                                color: theme.scoreColor,
                                border: `2px solid ${theme.scoreBorder}`,
                            }}
                        >
                            {Math.round(module.score)}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="module-card-progress-section">
                    <div className="module-card-progress-labels">
                        <span>Module Score</span>
                    </div>
                    <div className="module-card-progress-track">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${module.score}%` }}
                            transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
                            className="module-card-progress-fill"
                            style={{ backgroundColor: theme.progressBar }}
                        />
                    </div>
                </div>

                {/* Evidence description */}
                <p className="behavioral-evidence-text">{evidenceText}</p>

                {/* Sub-cards grid */}
                <div className="behavioral-subcards-grid">
                    {BEHAVIORAL_SUBCARDS.map((sub, i) => {
                        const scTheme = subCardThemes[i % subCardThemes.length]
                        return (
                            <motion.div
                                key={sub.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                className="behavioral-subcard"
                                style={{
                                    backgroundColor: scTheme.bg,
                                    border: `1px solid ${scTheme.border}`,
                                }}
                            >
                                <div className="behavioral-subcard-header">
                                    <span className="behavioral-subcard-label">{sub.label}</span>
                                    <span
                                        className="behavioral-subcard-severity"
                                        style={{
                                            color: sub.severityColor,
                                            backgroundColor: sub.severityColor + '14',
                                            border: `1px solid ${sub.severityColor}30`,
                                        }}
                                    >
                                        {sub.severity}
                                    </span>
                                </div>
                                <div
                                    className="behavioral-subcard-value"
                                    style={{ color: scTheme.valueColor }}
                                >
                                    {sub.value}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Hover shadow */}
            <div
                className="module-card-shadow"
                style={{
                    background: `radial-gradient(ellipse at center, ${theme.shadow} 0%, transparent 70%)`,
                }}
            />
        </motion.div>
    )
}
