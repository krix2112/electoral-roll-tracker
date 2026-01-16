import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from "@/components/diff-viewer/Sidebar";
import { AnalysisHeader } from "@/components/diff-viewer/AnalysisHeader";
import { AnimatedMetricCards } from "@/components/diff-viewer/AnimatedMetricCards";
import { InvestigationSlider } from "@/components/diff-viewer/InvestigationSlider";
import { ForensicComposition } from "@/components/diff-viewer/ForensicComposition";
import { PeakDetectionChart, ForensicIntensitySignal } from "@/components/diff-viewer/PeakDetectionChart";
import { SegmentDistribution } from "@/components/diff-viewer/SegmentDistribution";
import { ConstituencyHeatmap } from "@/components/diff-viewer/ConstituencyHeatmap";
import { ForensicAuditObservations } from "@/components/diff-viewer/ForensicAuditObservations";
import { DetailedChangeLog } from "@/components/diff-viewer/DetailedChangeLog";
import { ForensicRadarChart } from "@/components/diff-viewer/RadarChart";
import { VolumeRiskScatter } from "@/components/diff-viewer/ScatterPlot";
import { ConstituencyTreemap } from "@/components/diff-viewer/TreemapChart";
import { CircularProgressDashboard } from "@/components/diff-viewer/CircularProgress";
import { TimelineAnimation } from "@/components/diff-viewer/TimelineAnimation";
import { ParticleBackground } from "@/components/diff-viewer/ParticleBackground";
import { LiveAnomalyDetector } from "@/components/diff-viewer/LiveAnomalyDetector";
import { DataExplorerPanel } from "@/components/diff-viewer/DataExplorerPanel";
import { motion } from "framer-motion";
import { compareRolls, getUploads } from '../services/api';

export default function DiffViewer() {
  const navigate = useNavigate();
  const location = useLocation();

  // Keep existing state for data fetching compatibility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [comparisonData, setComparisonData] = useState({ added: [], deleted: [], modified: [] });
  const [comparisonStats, setComparisonStats] = useState(null);
  const [forensicData, setForensicData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const stateUploads = location.state?.uploads || [];
  const stateComparison = location.state?.comparison;

  const runForensicAnalysis = async () => {
    if (!uploads || uploads.length < 2) return;
    setAnalyzing(true);
    try {
      // Sort: Oldest [0], Newest [1]
      const sorted = [...uploads].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_upload_id: sorted[1].upload_id,
          previous_upload_id: sorted[0].upload_id
        })
      });
      const data = await res.json();
      setForensicData(data);
    } catch (e) { console.error(e); }
    setAnalyzing(false);
  };

  // ... (useEffect logic remains same)

  // Data Fetching Logic (Preserved)
  useEffect(() => {
    // ... (existing body)
    if (stateComparison && stateUploads.length >= 2) {
      setUploads(stateUploads);
      setComparisonData({
        added: stateComparison.added || [],
        deleted: stateComparison.deleted || [],
        modified: stateComparison.modified || []
      });
      setComparisonStats(stateComparison.stats);
      setLoading(false);
      return;
    }

    const fetchAndCompare = async () => {
      setLoading(true);
      setError(null);
      try {
        let uploadsToCompare = stateUploads;
        if (uploadsToCompare.length < 2) {
          const apiUploads = await getUploads();
          if (!apiUploads || apiUploads.length < 2) {
            // setError("Not enough files to compare");
          } else {
            uploadsToCompare = apiUploads.slice(0, 2);
          }
        }

        if (uploadsToCompare.length >= 2) {
          setUploads(uploadsToCompare);
          // Sort by date ASC
          const sorted = [...uploadsToCompare].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
          // compareRolls(new, old) -> verify signature. 
          // Usually compareRolls(current_id, previous_id).
          // So sorted[1] (new), sorted[0] (old).
          const result = await compareRolls(sorted[1].upload_id, sorted[0].upload_id);
          setComparisonData(result);
          setComparisonStats(result.stats);
        }
        setLoading(false);
      } catch (err) {
        console.error("Comparison error", err);
        setLoading(false);
      }
    };

    fetchAndCompare();
  }, [stateUploads, stateComparison]);

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden font-sans text-gray-900">
      <ParticleBackground />
      <Sidebar />

      <div className="flex-1 overflow-auto relative z-10">
        <AnalysisHeader />

        <motion.div
          className="p-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Forensic Trigger Section */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Forensic Investigation</h2>
              <p className="text-sm text-gray-500">Run advanced algorithms to detect suppression and anomalies</p>
            </div>
            <button
              onClick={runForensicAnalysis}
              disabled={analyzing}
              className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${analyzing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
            >
              {analyzing ? 'Analyzing...' : 'Run Forensic Analysis'}
            </button>
          </div>

          {/* Forensic Results Display */}
          {forensicData && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {forensicData.verdict}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Anomaly Score: {forensicData.final_anomaly_score}/100
                    </h3>
                  </div>
                  <p className="text-gray-700 max-w-2xl font-medium leading-relaxed">
                    {forensicData.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {forensicData.triggered_modules?.map(m => (
                      <span key={m} className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded border border-red-200">
                        ⚠️ {m} Detected
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-mono">ID: {forensicData.analysis_id}</p>
                </div>
              </div>
            </div>
          )}

          <AnimatedMetricCards />
          <InvestigationSlider />
          {/* Live Anomaly Detector - Full Width */}
          <LiveAnomalyDetector data={comparisonData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForensicComposition data={comparisonData} />
            </div>
            <div className="lg:col-span-1">
              <CircularProgressDashboard data={comparisonData} />
            </div>
          </div>

          {/* Data Explorer Panel - Full Width */}
          <DataExplorerPanel data={comparisonData} />

          {/* Charts Row - Peak Detection & Intensity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PeakDetectionChart data={comparisonData} />
            <ForensicIntensitySignal />
          </div>

          {/* Segment Distribution - Full Width */}
          <SegmentDistribution />

          {/* Advanced Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForensicRadarChart />
            <VolumeRiskScatter />
          </div>

          {/* Treemap & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConstituencyTreemap />
            <TimelineAnimation data={comparisonData} />
          </div>

          {/* Heatmap & Observations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConstituencyHeatmap />
            <ForensicAuditObservations />
          </div>

          {/* Detailed Change Log - Full Width */}
          <DetailedChangeLog data={comparisonData} />

          {/* Footer spacing */}
          <div className="h-8" />
        </motion.div>
      </div>
    </div>
  );
}