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
import { RadarChart as ForensicRadarChart } from "@/components/diff-viewer/RadarChart";
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
  
  const stateUploads = location.state?.uploads || [];
  const stateComparison = location.state?.comparison;

  // Data Fetching Logic (Preserved)
  useEffect(() => {
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
            // For now, allow rendering mock data even if fetch fails, or show loading
          } else {
             uploadsToCompare = apiUploads.slice(0, 2);
          }
        }
        
        if (uploadsToCompare.length >= 2) {
            setUploads(uploadsToCompare);
            const sorted = [...uploadsToCompare].sort((a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at));
            const result = await compareRolls(sorted[0].upload_id, sorted[1].upload_id);
            setComparisonData(result);
            setComparisonStats(result.stats);
        }
        setLoading(false);
      } catch (err) {
        console.error("Comparison error", err);
        // setError(err.message);
        setLoading(false); // Allow rendering even on error for now to show the UI
      }
    };

    fetchAndCompare();
  }, [stateUploads, stateComparison]);

  return (
    <div className="flex h-screen bg-gray-50 relative overflow-hidden font-sans text-gray-900">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        {/* Header */}
        <AnalysisHeader />

        {/* Content Area */}
        <motion.div 
          className="p-8 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Animated Metric Cards */}
          <AnimatedMetricCards />

          {/* Investigation Triggers */}
          <InvestigationSlider />

          {/* Live Anomaly Detector - Full Width */}
          <LiveAnomalyDetector />

          {/* Grid Layout - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ForensicComposition />
            </div>
            <div className="lg:col-span-1">
              <CircularProgressDashboard />
            </div>
          </div>

          {/* Data Explorer Panel - Full Width */}
          <DataExplorerPanel />

          {/* Charts Row - Peak Detection & Intensity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PeakDetectionChart />
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
            <TimelineAnimation />
          </div>

          {/* Heatmap & Observations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConstituencyHeatmap />
            <ForensicAuditObservations />
          </div>

          {/* Detailed Change Log - Full Width */}
          <DetailedChangeLog />

          {/* Footer spacing */}
          <div className="h-8" />
        </motion.div>
      </div>
    </div>
  );
}